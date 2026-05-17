import { v4 as uuidv4 } from 'uuid';
import {
  Torneo,
  ModalidadEliminatoria,
  IdSala,
  EventosSocket,
} from '@tipos-compartidos';
import { IRepositorioSalas } from '@dominio/repositorios/interfaces-repositorio';
import { IRepositorioTorneos } from '@dominio/repositorios/interfaces-repositorio-torneo';
import { GeneradorBracket } from '@dominio/servicios/generador-bracket';
import { GestorMinijuegos } from '@dominio/servicios/gestor-minijuegos';

/**
 * CASO DE USO: Iniciar Torneo
 *
 * Orquesta la creación del torneo:
 * 1. Valida que hay entre 2 y 4 equipos en la sala.
 * 2. Genera el bracket (emparejamientos) según el número de equipos.
 * 3. Selecciona el primer minijuego aleatoriamente.
 * 4. Persiste el torneo en Redis.
 * 5. Devuelve el payload para emitir `torneo_iniciado` y `mostrar_emparejamiento`.
 */
export class IniciarTorneoUseCase {
  constructor(
    private readonly repositorioSalas: IRepositorioSalas,
    private readonly repositorioTorneos: IRepositorioTorneos,
  ) {}

  async ejecutar(
    codigoSala: IdSala,
    modalidad: ModalidadEliminatoria,
  ): Promise<{
    torneoIniciado: EventosSocket.TorneoIniciadoPayload;
    primerEmparejamiento: EventosSocket.MostrarEmparejamientoPayload;
  }> {
    // 1. Obtener equipos de la sala
    const equipos = await this.repositorioSalas.obtenerEquiposDeSala(codigoSala);

    if (!equipos) {
      throw new Error('SALA_NO_ENCONTRADA');
    }

    if (equipos.length !== 2 && equipos.length !== 4) {
      throw new Error('CANTIDAD_EQUIPOS_INVALIDA');
    }

    // 2. Generar bracket
    const enfrentamientos = GeneradorBracket.generarEnfrentamientosIniciales(equipos, modalidad);

    // 3. Determinar fase inicial
    const fasaInicial = equipos.length === 2 ? 'final' : 'semifinal';

    // 4. Crear entidad Torneo
    const torneo: Torneo = {
      id: uuidv4(),
      idSala: codigoSala,
      estado: equipos.length === 2 ? 'final' : 'semifinales',
      fase: fasaInicial,
      equipos,
      modalidad,
      enfrentamientos,
      minijuegosUsadosEnTorneo: [],
      ganadorFinal: null,
      creadoEn: Date.now(),
    };

    // 5. Seleccionar primer minijuego
    const primerMinijuego = GestorMinijuegos.seleccionarSiguiente(
      torneo.minijuegosUsadosEnTorneo,
    );
    torneo.minijuegosUsadosEnTorneo.push(primerMinijuego);

    // Marcar el primer enfrentamiento activo como en progreso
    const primerEnfrentamientoActivo = enfrentamientos.find(
      (e) => e.estado === 'pendiente',
    );
    if (primerEnfrentamientoActivo) {
      primerEnfrentamientoActivo.estado = 'en_progreso';
      primerEnfrentamientoActivo.minijuegosJugados.push(primerMinijuego);
    }

    // 6. Persistir torneo
    await this.repositorioTorneos.guardarTorneo(torneo);

    // 7. Construir payloads
    const torneoIniciado: EventosSocket.TorneoIniciadoPayload = { torneo };

    const primerEmparejamiento: EventosSocket.MostrarEmparejamientoPayload = {
      enfrentamiento: primerEnfrentamientoActivo ?? enfrentamientos[0],
      minijuegoActual: primerMinijuego,
      numeroRonda: 1,
    };

    return { torneoIniciado, primerEmparejamiento };
  }
}
