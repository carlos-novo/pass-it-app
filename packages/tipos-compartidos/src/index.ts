// ============================================================
// ENTIDADES DE DOMINIO (Tipos base del modelo de negocio)
// ============================================================

/** Identificadores únicos del sistema */
export type IdEquipo = string;
export type IdTorneo = string;
export type IdSala = string;
export type IdMinijuego = string;

/** Modalidad de la eliminatoria: mejor de N */
export type ModalidadEliminatoria = 1 | 3 | 5;

/** Estado de una sala de lobby */
export type EstadoSala = 'esperando' | 'en_juego' | 'finalizada';

/** Estado de un torneo */
export type EstadoTorneo = 'esperando' | 'semifinales' | 'final' | 'finalizado';

/** Fase del torneo */
export type FaseTorneo = 'semifinal' | 'final';

/** Identificador de cada minijuego disponible */
export type TipoMinijuego =
  | 'reflejos_puros'
  | 'cronometro_ciego'
  | 'duelo_pulsaciones'
  | 'simon_dice'
  | 'patron_desbloqueo'
  | 'calculo_extremo'
  | 'la_bomba'
  | 'reto_rae'
  | 'el_intruso'
  | 'memoria_fotografica';

/** Representación de un equipo dentro del sistema */
export interface Equipo {
  id: IdEquipo;
  nombre: string;
  puntuacion: number;
  /** Timestamp de conexión al lobby */
  conectadoEn: number;
}

/** Resultado de un equipo en un minijuego */
export interface ResultadoMinijuego {
  idEquipo: IdEquipo;
  tipoMinijuego: TipoMinijuego;
  valorNumerico: number; // tiempo, puntaje, cantidad, etc.
  ganado: boolean;
  timestamp: number;
}

/** Un enfrentamiento entre exactamente dos equipos */
export interface Enfrentamiento {
  idEnfrentamiento: string;
  fase: FaseTorneo;
  idEquipo1: IdEquipo;
  idEquipo2: IdEquipo;
  modalidad: ModalidadEliminatoria;
  minijuegosJugados: TipoMinijuego[];
  victorias: Record<IdEquipo, number>;
  ganador: IdEquipo | null;
  estado: 'pendiente' | 'en_progreso' | 'finalizado';
}

/** Estado completo del torneo (almacenado en Redis) */
export interface Torneo {
  id: IdTorneo;
  idSala: IdSala;
  estado: EstadoTorneo;
  fase: FaseTorneo | null;
  equipos: Equipo[];
  modalidad: ModalidadEliminatoria;
  enfrentamientos: Enfrentamiento[];
  minijuegosUsadosEnTorneo: TipoMinijuego[];
  ganadorFinal: IdEquipo | null;
  creadoEn: number;
}

// ============================================================
// PAYLOADS DE SOCKET.IO (Contratos de comunicación en tiempo real)
// ============================================================

/** Namespace para todos los eventos de Socket.io */
export namespace EventosSocket {

  // --- EVENTOS: Cliente → Servidor ---

  export interface CrearSalaPayload {
    nombreEquipo: string;
  }

  export interface UnirseASalaPayload {
    codigoSala: string;
    nombreEquipo: string;
  }

  export interface IniciarTorneoPayload {
    idSala: IdSala;
    modalidad: ModalidadEliminatoria;
  }

  export interface EnviarResultadoMinijuegoPayload {
    idSala: IdSala;
    idEquipo: IdEquipo;
    tipoMinijuego: TipoMinijuego;
    valorNumerico: number;
  }

  // --- EVENTOS: Servidor → Cliente ---

  export interface SalaCreadaPayload {
    codigoSala: IdSala;
    equipo: Equipo;
  }

  export interface SalaActualizadaPayload {
    codigoSala: IdSala;
    equipos: Equipo[];
    estado: EstadoSala;
  }

  export interface EquipoUnidoPayload {
    equipo: Equipo;
    equiposEnSala: Equipo[];
  }

  export interface TorneoIniciadoPayload {
    torneo: Torneo;
  }

  export interface MostrarEmparejamientoPayload {
    enfrentamiento: Enfrentamiento;
    minijuegoActual: TipoMinijuego;
    numeroRonda: number;
  }

  export interface MinijuegoFinalizadoPayload {
    enfrentamiento: Enfrentamiento;
    resultado: ResultadoMinijuego[];
    ganadorRonda: IdEquipo;
  }

  export interface TorneoFinalizadoPayload {
    torneo: Torneo;
    campeon: Equipo;
  }

  export interface ErrorPayload {
    codigo: string;
    mensaje: string;
  }
}

// ============================================================
// CONSTANTES COMPARTIDAS
// ============================================================

export const POOL_MINIJUEGOS: TipoMinijuego[] = [
  'reflejos_puros',
  'cronometro_ciego',
  'duelo_pulsaciones',
  'simon_dice',
  'patron_desbloqueo',
  'calculo_extremo',
  'la_bomba',
  'reto_rae',
  'el_intruso',
  'memoria_fotografica',
];

export const NOMBRE_MINIJUEGO: Record<TipoMinijuego, string> = {
  reflejos_puros: 'Reflejos Puros',
  cronometro_ciego: 'Cronómetro Ciego',
  duelo_pulsaciones: 'Duelo de Pulsaciones',
  simon_dice: 'Simón Dice',
  patron_desbloqueo: 'Patrón de Desbloqueo',
  calculo_extremo: 'Cálculo Extremo',
  la_bomba: 'La Bomba',
  reto_rae: 'El Reto de la RAE',
  el_intruso: 'El Intruso',
  memoria_fotografica: 'Memoria Fotográfica',
};
