import { v4 as uuidv4 } from 'uuid';
import { Equipo, IdSala, EventosSocket } from '@tipos-compartidos';
import { IRepositorioSalas } from '@dominio/repositorios/interfaces-repositorio';

export type ResultadoUnirseASala =
  | { exito: true; payload: EventosSocket.EquipoUnidoPayload; codigoSala: IdSala }
  | { exito: false; error: EventosSocket.ErrorPayload };

/**
 * CASO DE USO: Unirse a Sala
 *
 * Valida que la sala existe y tiene capacidad, añade al equipo
 * y construye los payloads para los eventos de socket.
 */
export class UnirseASalaUseCase {
  private static readonly MAX_EQUIPOS = 4;

  constructor(private readonly repositorioSalas: IRepositorioSalas) {}

  async ejecutar(
    codigoSala: IdSala,
    nombreEquipo: string,
  ): Promise<ResultadoUnirseASala> {
    // Validación 1: ¿Existe la sala?
    const equiposActuales = await this.repositorioSalas.obtenerEquiposDeSala(codigoSala);

    if (equiposActuales === null) {
      return {
        exito: false,
        error: {
          codigo: 'SALA_NO_ENCONTRADA',
          mensaje: `No existe ninguna sala con el código "${codigoSala}". Verifica el código e inténtalo de nuevo.`,
        },
      };
    }

    // Validación 2: ¿Hay sitio?
    if (equiposActuales.length >= UnirseASalaUseCase.MAX_EQUIPOS) {
      return {
        exito: false,
        error: {
          codigo: 'SALA_LLENA',
          mensaje: `La sala "${codigoSala}" ya tiene ${UnirseASalaUseCase.MAX_EQUIPOS} equipos. No se pueden añadir más.`,
        },
      };
    }

    const nuevoEquipo: Equipo = {
      id: uuidv4(),
      nombre: nombreEquipo,
      puntuacion: 0,
      conectadoEn: Date.now(),
    };

    await this.repositorioSalas.unirseASala(codigoSala, nuevoEquipo);

    const equiposActualizados = [...equiposActuales, nuevoEquipo];

    return {
      exito: true,
      codigoSala,
      payload: {
        equipo: nuevoEquipo,
        equiposEnSala: equiposActualizados,
      },
    };
  }
}
