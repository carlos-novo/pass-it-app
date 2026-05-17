import { useEffect } from 'react';
import { useSalaStore } from '@store/sala.store';
import { useTorneoStore } from '@store/torneo.store';
import { useSocket } from './useSocket';
import {
  EventosSocket,
  ModalidadEliminatoria,
} from '@dominio';

/**
 * HOOK: useTorneo
 *
 * Suscribe a todos los eventos de Socket.io relacionados con el torneo.
 * Actualiza el store de Zustand `useTorneoStore` en cada evento.
 *
 * Expone:
 * - iniciarTorneo(modalidad): emite `iniciar_torneo`
 * - reportarResultado(idEnfrentamiento, idEquipoGanador): emite `resultado_minijuego`
 */
export function useTorneo(): {
  iniciarTorneo: (modalidad: ModalidadEliminatoria) => void;
  reportarResultado: (idEnfrentamiento: string, idEquipoGanador: string) => void;
} {
  const { socket } = useSocket();
  const codigoSala = useSalaStore((s) => s.codigoSala);
  const {
    establecerTorneo,
    establecerEmparejamientoActual,
    establecerGanadorFinal,
    marcarTorneoFinalizado,
  } = useTorneoStore();

  useEffect(() => {
    if (!socket) return;

    const onTorneoIniciado = (payload: EventosSocket.TorneoIniciadoPayload): void => {
      establecerTorneo(payload.torneo);
    };

    const onMostrarEmparejamiento = (
      payload: EventosSocket.MostrarEmparejamientoPayload,
    ): void => {
      establecerEmparejamientoActual(payload);
    };

    const onTorneoFinalizado = (payload: EventosSocket.TorneoFinalizadoPayload): void => {
      establecerGanadorFinal(payload.campeon);
      marcarTorneoFinalizado(payload.torneo);
    };

    socket.on('torneo_iniciado', onTorneoIniciado);
    socket.on('mostrar_emparejamiento', onMostrarEmparejamiento);
    socket.on('torneo_finalizado', onTorneoFinalizado);

    return () => {
      socket.off('torneo_iniciado', onTorneoIniciado);
      socket.off('mostrar_emparejamiento', onMostrarEmparejamiento);
      socket.off('torneo_finalizado', onTorneoFinalizado);
    };
  }, [socket, establecerTorneo, establecerEmparejamientoActual, establecerGanadorFinal, marcarTorneoFinalizado]);

  const iniciarTorneo = (modalidad: ModalidadEliminatoria): void => {
    if (!socket || !codigoSala) return;
    socket.emit('iniciar_torneo', { codigoSala, modalidad });
  };

  const reportarResultado = (idEnfrentamiento: string, idEquipoGanador: string): void => {
    if (!socket || !codigoSala) return;
    socket.emit('resultado_minijuego', { codigoSala, idEnfrentamiento, idEquipoGanador });
  };

  return { iniciarTorneo, reportarResultado };
}
