export type IdEquipo = string;
export type IdTorneo = string;
export type IdSala = string;
export type IdMinijuego = string;
export type ModalidadEliminatoria = 1 | 3 | 5;
export type EstadoSala = 'esperando' | 'en_juego' | 'finalizada';
export type EstadoTorneo = 'esperando' | 'semifinales' | 'final' | 'finalizado';
export type FaseTorneo = 'semifinal' | 'final';
export type TipoMinijuego = 'reflejos_puros' | 'cronometro_ciego' | 'duelo_pulsaciones' | 'simon_dice' | 'patron_desbloqueo' | 'calculo_extremo' | 'la_bomba' | 'reto_rae' | 'el_intruso' | 'memoria_fotografica';
export interface Equipo {
    id: IdEquipo;
    nombre: string;
    puntuacion: number;
    conectadoEn: number;
}
export interface ResultadoMinijuego {
    idEquipo: IdEquipo;
    tipoMinijuego: TipoMinijuego;
    valorNumerico: number;
    ganado: boolean;
    timestamp: number;
}
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
export declare namespace EventosSocket {
    interface CrearSalaPayload {
        nombreEquipo: string;
    }
    interface UnirseASalaPayload {
        codigoSala: string;
        nombreEquipo: string;
    }
    interface IniciarTorneoPayload {
        idSala: IdSala;
        modalidad: ModalidadEliminatoria;
    }
    interface EnviarResultadoMinijuegoPayload {
        idSala: IdSala;
        idEquipo: IdEquipo;
        tipoMinijuego: TipoMinijuego;
        valorNumerico: number;
    }
    interface SalaCreadaPayload {
        codigoSala: IdSala;
        equipo: Equipo;
    }
    interface SalaActualizadaPayload {
        codigoSala: IdSala;
        equipos: Equipo[];
        estado: EstadoSala;
    }
    interface EquipoUnidoPayload {
        equipo: Equipo;
        equiposEnSala: Equipo[];
    }
    interface TorneoIniciadoPayload {
        torneo: Torneo;
    }
    interface MostrarEmparejamientoPayload {
        enfrentamiento: Enfrentamiento;
        minijuegoActual: TipoMinijuego;
        numeroRonda: number;
    }
    interface MinijuegoFinalizadoPayload {
        enfrentamiento: Enfrentamiento;
        resultado: ResultadoMinijuego[];
        ganadorRonda: IdEquipo;
    }
    interface TorneoFinalizadoPayload {
        torneo: Torneo;
        campeon: Equipo;
    }
    interface ErrorPayload {
        codigo: string;
        mensaje: string;
    }
}
export declare const POOL_MINIJUEGOS: TipoMinijuego[];
export declare const NOMBRE_MINIJUEGO: Record<TipoMinijuego, string>;
