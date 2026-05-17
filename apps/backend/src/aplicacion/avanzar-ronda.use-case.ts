import {
  Torneo,
  Enfrentamiento,
  Equipo,
  IdSala,
  EventosSocket,
} from '@tipos-compartidos';
import { IRepositorioSalas } from '@dominio/repositorios/interfaces-repositorio';
import { IRepositorioTorneos } from '@dominio/repositorios/interfaces-repositorio-torneo';
import { GestorMinijuegos } from '@dominio/servicios/gestor-minijuegos';
import { GeneradorBracket } from '@dominio/servicios/generador-bracket';

export type ResultadoAvanzarRonda =
  | { tipo: 'siguiente_minijuego'; payload: EventosSocket.MostrarEmparejamientoPayload }
  | { tipo: 'enfrentamiento_ganado'; payload: EventosSocket.MinijuegoFinalizadoPayload; torneo: Torneo }
  | { tipo: 'torneo_finalizado'; payload: EventosSocket.TorneoFinalizadoPayload }
  | { tipo: 'final_iniciada'; enfrentamiento: Enfrentamiento; minijuego: EventosSocket.MostrarEmparejamientoPayload };

/**
 * CASO DE USO: Avanzar Ronda
 *
 * Evalúa el resultado de un minijuego y determina qué ocurre a continuación:
 * - ¿Hay más minijuegos en este enfrentamiento? → siguiente minijuego
 * - ¿Se cerró el enfrentamiento? → ¿Hay final? → iniciar final
 * - ¿Es la final y hay ganador? → Torneo finalizado
 */
export class AvanzarRondaUseCase {
  constructor(
    private readonly repositorioSalas: IRepositorioSalas,
    private readonly repositorioTorneos: IRepositorioTorneos,
  ) {}

  async ejecutar(
    codigoSala: IdSala,
    idEnfrentamiento: string,
    idEquipoGanadorMinijuego: string,
  ): Promise<ResultadoAvanzarRonda> {
    const torneo = await this.repositorioTorneos.obtenerTorneoPorSala(codigoSala);
    if (!torneo) throw new Error('TORNEO_NO_ENCONTRADO');

    const enfrentamiento = torneo.enfrentamientos.find(
      (e) => e.idEnfrentamiento === idEnfrentamiento,
    );
    if (!enfrentamiento) throw new Error('ENFRENTAMIENTO_NO_ENCONTRADO');

    // Registrar victoria en el enfrentamiento
    enfrentamiento.victorias[idEquipoGanadorMinijuego] =
      (enfrentamiento.victorias[idEquipoGanadorMinijuego] ?? 0) + 1;

    const victoriasNecesarias = Math.ceil(enfrentamiento.modalidad / 2);
    const victoriasActuales = enfrentamiento.victorias[idEquipoGanadorMinijuego];

    // Construir resultado del minijuego
    const equipoGanador = torneo.equipos.find((e) => e.id === idEquipoGanadorMinijuego)!;
    const resultadoMinijuego: EventosSocket.MinijuegoFinalizadoPayload = {
      enfrentamiento,
      resultado: [],
      ganadorRonda: idEquipoGanadorMinijuego,
    };

    // ¿Tiene el ganador suficientes victorias para ganar el enfrentamiento?
    if (victoriasActuales >= victoriasNecesarias) {
      enfrentamiento.ganador = idEquipoGanadorMinijuego;
      enfrentamiento.estado = 'finalizado';
      await this.repositorioTorneos.actualizarTorneo(torneo);

      // ¿Era la final?
      if (enfrentamiento.fase === 'final') {
        torneo.estado = 'finalizado';
        torneo.ganadorFinal = idEquipoGanadorMinijuego;
        await this.repositorioTorneos.actualizarTorneo(torneo);

        return {
          tipo: 'torneo_finalizado',
          payload: {
            torneo,
            campeon: equipoGanador,
          },
        };
      }

      // Era una semifinal → ¿Están todas terminadas?
      const todasSemifinalesTerminadas = torneo.enfrentamientos
        .filter((e) => e.fase === 'semifinal')
        .every((e) => e.estado === 'finalizado');

      if (todasSemifinalesTerminadas) {
        // Crear la Final
        const ganadores = torneo.enfrentamientos
          .filter((e) => e.fase === 'semifinal')
          .map((e) => torneo.equipos.find((eq) => eq.id === e.ganador)!);

        const final = GeneradorBracket.crearFinal(ganadores[0], ganadores[1], enfrentamiento.modalidad);
        torneo.enfrentamientos.push(final);
        torneo.estado = 'final';
        torneo.fase = 'final';

        // Seleccionar primer minijuego de la final
        const minijuegoFinal = GestorMinijuegos.seleccionarSiguiente(torneo.minijuegosUsadosEnTorneo);
        torneo.minijuegosUsadosEnTorneo.push(minijuegoFinal);
        final.estado = 'en_progreso';
        final.minijuegosJugados.push(minijuegoFinal);

        await this.repositorioTorneos.actualizarTorneo(torneo);

        return {
          tipo: 'final_iniciada',
          enfrentamiento: final,
          minijuego: {
            enfrentamiento: final,
            minijuegoActual: minijuegoFinal,
            numeroRonda: 1,
          },
        };
      }

      return { tipo: 'enfrentamiento_ganado', payload: resultadoMinijuego, torneo };
    }

    // El enfrentamiento continúa → siguiente minijuego
    const siguienteMinijuego = GestorMinijuegos.seleccionarSiguiente(torneo.minijuegosUsadosEnTorneo);
    torneo.minijuegosUsadosEnTorneo.push(siguienteMinijuego);
    enfrentamiento.minijuegosJugados.push(siguienteMinijuego);
    await this.repositorioTorneos.actualizarTorneo(torneo);

    const numeroRonda = enfrentamiento.minijuegosJugados.length;

    return {
      tipo: 'siguiente_minijuego',
      payload: {
        enfrentamiento,
        minijuegoActual: siguienteMinijuego,
        numeroRonda,
      },
    };
  }

  private encontrarEquipo(torneo: Torneo, id: string): Equipo | undefined {
    return torneo.equipos.find((e) => e.id === id);
  }
}
