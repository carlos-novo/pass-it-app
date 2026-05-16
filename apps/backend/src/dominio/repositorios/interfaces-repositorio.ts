import {
  Equipo,
  Torneo,
  IdSala,
  IdTorneo,
  TipoMinijuego,
} from '@tipos-compartidos';

/**
 * INTERFAZ DE REPOSITORIO DE SALAS
 *
 * Define el contrato que debe implementar cualquier adaptador de persistencia
 * para las salas de juego. La capa de dominio depende de esta abstracción,
 * NUNCA de la implementación concreta (Redis, en memoria, etc.).
 *
 * Principio: Dependency Inversion (SOLID)
 */
export interface IRepositorioSalas {
  /**
   * Crea una nueva sala con un código conocido y la persiste.
   * @param primerEquipo Equipo que crea la sala (host)
   * @param codigoSala Código único asignado a la sala
   * @returns El código único de la sala creada.
   */
  crearSala(primerEquipo: Equipo, codigoSala: IdSala): Promise<IdSala>;

  /**
   * Añade un equipo a una sala existente.
   * @throws Error si la sala no existe o está completa (> 4 equipos).
   */
  unirseASala(codigoSala: IdSala, equipo: Equipo): Promise<void>;

  /**
   * Recupera todos los equipos de una sala.
   * @returns Lista de equipos o null si la sala no existe.
   */
  obtenerEquiposDeSala(codigoSala: IdSala): Promise<Equipo[] | null>;

  /**
   * Elimina un equipo de una sala por desconexión.
   */
  eliminarEquipoDeSala(codigoSala: IdSala, idEquipo: string): Promise<void>;
}

/**
 * INTERFAZ DE REPOSITORIO DE TORNEOS
 *
 * Contrato de persistencia para el estado del torneo activo.
 */
export interface IRepositorioTorneos {
  /** Persiste un nuevo torneo y devuelve su ID */
  guardarTorneo(torneo: Torneo): Promise<IdTorneo>;

  /** Recupera el torneo asociado a una sala */
  obtenerTorneoPorSala(codigoSala: IdSala): Promise<Torneo | null>;

  /** Actualiza el estado de un torneo en progreso */
  actualizarTorneo(torneo: Torneo): Promise<void>;

  /** Marca los minijuegos ya usados en el torneo */
  registrarMinijuegoUsado(
    idTorneo: IdTorneo,
    tipo: TipoMinijuego,
  ): Promise<void>;
}

/** Token de inyección de dependencias para los repositorios */
export const REPOSITORIO_SALAS = 'REPOSITORIO_SALAS';
export const REPOSITORIO_TORNEOS = 'REPOSITORIO_TORNEOS';
