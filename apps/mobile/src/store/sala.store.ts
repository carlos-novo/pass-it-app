import { create } from 'zustand';
import { Equipo, IdSala } from '@dominio';

/**
 * STORE DE SALA (Zustand)
 *
 * Estado reactivo global de la sala de lobby actual.
 * Se hidratará con los eventos de Socket.io en el Módulo 2.
 */
interface EstadoSalaStore {
  /** Código de la sala actual (null si no hay sala activa) */
  codigoSala: IdSala | null;
  /** Equipo propio del dispositivo */
  miEquipo: Equipo | null;
  /** Lista de todos los equipos en la sala */
  equipos: Equipo[];
  /** Estado de conexión al socket */
  conectado: boolean;

  // Acciones
  establecerSala: (codigoSala: IdSala, equipo: Equipo) => void;
  actualizarEquipos: (equipos: Equipo[]) => void;
  establecerConectado: (estado: boolean) => void;
  reiniciar: () => void;
}

const estadoInicial = {
  codigoSala: null,
  miEquipo: null,
  equipos: [],
  conectado: false,
};

export const useSalaStore = create<EstadoSalaStore>((set) => ({
  ...estadoInicial,

  establecerSala: (codigoSala, equipo) =>
    set({ codigoSala, miEquipo: equipo }),

  actualizarEquipos: (equipos) => set({ equipos }),

  establecerConectado: (conectado) => set({ conectado }),

  reiniciar: () => set(estadoInicial),
}));
