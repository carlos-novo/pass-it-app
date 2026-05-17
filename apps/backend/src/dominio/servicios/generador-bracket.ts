import {
  Equipo,
  Enfrentamiento,
  FaseTorneo,
  ModalidadEliminatoria,
} from '@tipos-compartidos';
import { v4 as uuidv4 } from 'uuid';

/**
 * SERVICIO DE DOMINIO: Generador de Brackets
 *
 * Encapsula la lógica pura de generación del cuadro del torneo.
 * Sin dependencias de frameworks. Testeable de forma unitaria.
 *
 * Reglas de negocio:
 * - 2 equipos → 1 enfrentamiento (Final directa)
 * - 3 equipos → 2 semifinales + 1 final (el primero recibe bye automático)
 * - 4 equipos → 2 semifinales + 1 final
 */
export class GeneradorBracket {
  /**
   * Genera los enfrentamientos iniciales del torneo.
   * @param equipos - Lista de equipos ordenada por tiempo de entrada al lobby
   * @param modalidad - Al mejor de 1, 3 o 5
   */
  static generarEnfrentamientosIniciales(
    equipos: Equipo[],
    modalidad: ModalidadEliminatoria,
  ): Enfrentamiento[] {
    const numEquipos = equipos.length;

    if (numEquipos < 2 || numEquipos > 4) {
      throw new Error(
        `Número de equipos inválido: ${numEquipos}. Se requieren entre 2 y 4 equipos.`,
      );
    }

    if (numEquipos === 2) {
      // Final directa
      return [this.crearEnfrentamiento(equipos[0], equipos[1], 'final', modalidad)];
    }

    if (numEquipos === 3) {
      // Equipo 1 vs Equipo 2 en semifinal. Equipo 3 pasa directo (bye).
      // La segunda semifinal se crea como placeholder para el bracket
      const semi1 = this.crearEnfrentamiento(equipos[0], equipos[1], 'semifinal', modalidad);
      const semi2 = this.crearEnfrentamiento(equipos[2], equipos[2], 'semifinal', modalidad);
      semi2.ganador = equipos[2].id; // Bye automático
      semi2.estado = 'finalizado';
      return [semi1, semi2];
    }

    // 4 equipos: 2 semifinales
    const semi1 = this.crearEnfrentamiento(equipos[0], equipos[1], 'semifinal', modalidad);
    const semi2 = this.crearEnfrentamiento(equipos[2], equipos[3], 'semifinal', modalidad);
    return [semi1, semi2];
  }

  /**
   * Crea el enfrentamiento de la Final con los ganadores de las semifinales.
   */
  static crearFinal(
    ganadorSemi1: Equipo,
    ganadorSemi2: Equipo,
    modalidad: ModalidadEliminatoria,
  ): Enfrentamiento {
    return this.crearEnfrentamiento(ganadorSemi1, ganadorSemi2, 'final', modalidad);
  }

  private static crearEnfrentamiento(
    equipo1: Equipo,
    equipo2: Equipo,
    fase: FaseTorneo,
    modalidad: ModalidadEliminatoria,
  ): Enfrentamiento {
    return {
      idEnfrentamiento: uuidv4(),
      fase,
      idEquipo1: equipo1.id,
      idEquipo2: equipo2.id,
      modalidad,
      minijuegosJugados: [],
      victorias: { [equipo1.id]: 0, [equipo2.id]: 0 },
      ganador: null,
      estado: 'pendiente',
    };
  }
}
