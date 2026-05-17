import { useEffect, useRef, useState } from 'react';
import useSocket, { conectar } from '@hooks/useSocket';
import { useSalaStore } from '@store/sala.store';
import { EventosSocket } from '@tipos-compartidos';

export default function useSala() {
  const { socket: obtenerSocket } = useSocket();
  const [ultimoError, setUltimoError] = useState<EventosSocket.ErrorPayload | null>(null);
  const lastJoinCodeRef = useRef<string | null>(null);

  useEffect(() => {
    const s = obtenerSocket();
    if (!s) return;

    const onSalaCreada = (payload: EventosSocket.SalaCreadaPayload) => {
      useSalaStore.getState().establecerSala(payload.codigoSala, payload.equipo);
      useSalaStore.getState().actualizarEquipos([payload.equipo]);
    };

    const onEquipoUnido = (payload: EventosSocket.EquipoUnidoPayload) => {
      const codigo = lastJoinCodeRef.current ?? useSalaStore.getState().codigoSala ?? null;
      if (codigo) useSalaStore.getState().establecerSala(codigo, payload.equipo);
      useSalaStore.getState().actualizarEquipos(payload.equiposEnSala);
    };

    const onSalaActualizada = (payload: EventosSocket.SalaActualizadaPayload) => {
      useSalaStore.getState().actualizarEquipos(payload.equipos);
    };

    const onError = (payload: EventosSocket.ErrorPayload) => {
      setUltimoError(payload);
    };

    s.on('sala_creada', onSalaCreada);
    s.on('equipo_unido', onEquipoUnido);
    s.on('sala_actualizada', onSalaActualizada);
    s.on('error', onError);

    return () => {
      s.off('sala_creada', onSalaCreada);
      s.off('equipo_unido', onEquipoUnido);
      s.off('sala_actualizada', onSalaActualizada);
      s.off('error', onError);
    };
  }, [obtenerSocket]);

  const crearSala = (nombreEquipo: string) => {
    const s = conectar();
    s.emit('crear_sala', { nombreEquipo });
  };

  const unirseASala = (codigo: string, nombreEquipo: string) => {
    const s = conectar();
    const codigoUpper = codigo.trim().toUpperCase();
    lastJoinCodeRef.current = codigoUpper;
    s.emit('unirse_a_sala', { codigoSala: codigoUpper, nombreEquipo });
  };

  return { crearSala, unirseASala, ultimoError };
}
