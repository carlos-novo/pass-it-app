import { create } from 'zustand';
import { Torneo, Equipo, EventosSocket } from '@dominio';

interface EstadoTorneoStore {
  torneo: Torneo | null;
  emparejamientoActual: EventosSocket.MostrarEmparejamientoPayload | null;
  ganadorFinal: Equipo | null;
  torneoFinalizado: boolean;

  // Acciones
  establecerTorneo: (torneo: Torneo) => void;
  establecerEmparejamientoActual: (payload: EventosSocket.MostrarEmparejamientoPayload) => void;
  establecerGanadorFinal: (campeon: Equipo) => void;
  marcarTorneoFinalizado: (torneo: Torneo) => void;
  reiniciar: () => void;
}

const estadoInicial = {
  torneo: null,
  emparejamientoActual: null,
  ganadorFinal: null,
  torneoFinalizado: false,
};

export const useTorneoStore = create<EstadoTorneoStore>((set) => ({
  ...estadoInicial,

  establecerTorneo: (torneo) => set({ torneo }),

  establecerEmparejamientoActual: (payload) =>
    set({ emparejamientoActual: payload }),

  establecerGanadorFinal: (campeon) => set({ ganadorFinal: campeon }),

  marcarTorneoFinalizado: (torneo) =>
    set({ torneo, torneoFinalizado: true }),

  reiniciar: () => set(estadoInicial),
}));
