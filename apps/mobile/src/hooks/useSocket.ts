import { useMemo } from 'react';
import { io, Socket } from 'socket.io-client';

const URL = process.env.EXPO_PUBLIC_BACKEND_URL ?? 'http://localhost:3000';

let socketInstance: Socket | null = null;

function crearInstancia(): Socket {
  if (!socketInstance) {
    socketInstance = io(URL, { autoConnect: false });
  }
  return socketInstance;
}

export function conectar(): Socket {
  const s = crearInstancia();
  if (!s.connected) s.connect();
  return s;
}

export function desconectar(): void {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
}

export function socket(): Socket | null {
  return socketInstance;
}

export default function useSocket() {
  // helper hook for components — memoize nothing heavy here
  useMemo(() => crearInstancia(), []);
  return { conectar, desconectar, socket };
}
