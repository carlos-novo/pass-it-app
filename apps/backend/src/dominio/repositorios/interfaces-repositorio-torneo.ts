import {
  Torneo,
  IdTorneo,
  IdSala,
  TipoMinijuego,
} from '@tipos-compartidos';

/**
 * INTERFAZ DE REPOSITORIO DE TORNEOS
 *
 * Contrato de persistencia para el estado completo del torneo activo.
 * La capa de aplicación depende únicamente de esta abstracción.
 */
export interface IRepositorioTorneos {
  /** Persiste un nuevo torneo y devuelve su ID */
  guardarTorneo(torneo: Torneo): Promise<IdTorneo>;

  /** Recupera el torneo activo asociado a una sala */
  obtenerTorneoPorSala(codigoSala: IdSala): Promise<Torneo | null>;

  /** Actualiza el estado completo del torneo en Redis */
  actualizarTorneo(torneo: Torneo): Promise<void>;

  /** Añade un minijuego a la lista de usados en el torneo */
  registrarMinijuegoUsado(idTorneo: IdTorneo, tipo: TipoMinijuego): Promise<void>;
}

/** Token de inyección de dependencias */
export const REPOSITORIO_TORNEOS = 'REPOSITORIO_TORNEOS';
