import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { MotiView } from 'moti';
import { useSalaStore } from '@store/sala.store';
import { useTorneoStore } from '@store/torneo.store';
import { useTorneo } from '@hooks/useTorneo';
import { NOMBRE_MINIJUEGO } from '@dominio';

/**
 * Pantalla del Bracket — Cuadro del torneo animado.
 * Se actualiza en tiempo real conforme avanza el torneo.
 */
export default function PantallaBracket(): JSX.Element {
  const router = useRouter();
  const { torneo, emparejamientoActual, ganadorFinal } = useTorneoStore();
  const equipos = useSalaStore((s) => s.equipos);
  const miEquipo = useSalaStore((s) => s.miEquipo);

  useTorneo(); // Suscripción a eventos de torneo

  const obtenerNombreEquipo = (id: string): string =>
    equipos.find((e) => e.id === id)?.nombre ?? '???';

  if (ganadorFinal) {
    return (
      <View style={estilos.contenedor}>
        <MotiView
          from={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 10 }}
          style={estilos.ganadorContenedor}
        >
          <Text style={estilos.trofeo}>🏆</Text>
          <Text style={estilos.ganadorTitulo}>¡CAMPEÓN!</Text>
          <Text style={estilos.ganadorNombre}>{ganadorFinal.nombre}</Text>
          {miEquipo?.id === ganadorFinal.id && (
            <Text style={estilos.tuEquipoGano}>¡Es tu equipo! 🎉</Text>
          )}
        </MotiView>
      </View>
    );
  }

  if (!torneo) {
    return (
      <View style={estilos.contenedor}>
        <Text style={estilos.esperando}>Esperando inicio del torneo...</Text>
      </View>
    );
  }

  return (
    <View style={estilos.contenedor}>
      {/* Título de fase */}
      <MotiView
        from={{ opacity: 0, translateY: -20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 400 }}
      >
        <Text style={estilos.faseTitulo}>
          {torneo.estado === 'semifinales' ? '⚔️ SEMIFINALES' : '🏆 GRAN FINAL'}
        </Text>
      </MotiView>

      {/* Enfrentamientos */}
      <View style={estilos.bracketContenedor}>
        {torneo.enfrentamientos
          .filter((e) => e.fase === torneo.fase)
          .map((enf, index) => (
            <MotiView
              key={enf.idEnfrentamiento}
              from={{ opacity: 0, translateX: -50 }}
              animate={{ opacity: 1, translateX: 0 }}
              transition={{ type: 'timing', duration: 500, delay: index * 150 }}
              style={[
                estilos.tarjetaEnfrentamiento,
                emparejamientoActual?.enfrentamiento.idEnfrentamiento === enf.idEnfrentamiento &&
                  estilos.tarjetaActiva,
              ]}
            >
              <View style={estilos.equipoFila}>
                <Text style={estilos.equipoNombre}>{obtenerNombreEquipo(enf.idEquipo1)}</Text>
                <Text style={estilos.victoriasTexto}>
                  {enf.victorias[enf.idEquipo1] ?? 0}
                </Text>
              </View>
              <Text style={estilos.versus}>VS</Text>
              <View style={estilos.equipoFila}>
                <Text style={estilos.equipoNombre}>{obtenerNombreEquipo(enf.idEquipo2)}</Text>
                <Text style={estilos.victoriasTexto}>
                  {enf.victorias[enf.idEquipo2] ?? 0}
                </Text>
              </View>
            </MotiView>
          ))}
      </View>

      {/* Minijuego actual */}
      {emparejamientoActual && (
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring' }}
          style={estilos.minijuegoContenedor}
        >
          <Text style={estilos.minijuegoLabel}>SIGUIENTE MINIJUEGO</Text>
          <Text style={estilos.minijuegoNombre}>
            {NOMBRE_MINIJUEGO[emparejamientoActual.minijuegoActual]}
          </Text>
          <Text style={estilos.rondaTexto}>
            Ronda {emparejamientoActual.numeroRonda} · Al mejor de{' '}
            {emparejamientoActual.enfrentamiento.modalidad}
          </Text>
        </MotiView>
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: '#0D0D1A',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  faseTitulo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6C63FF',
    textAlign: 'center',
    marginBottom: 32,
    letterSpacing: 2,
  },
  bracketContenedor: {
    width: '100%',
    gap: 16,
    marginBottom: 32,
  },
  tarjetaEnfrentamiento: {
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2A2A4A',
    alignItems: 'center',
    gap: 8,
  },
  tarjetaActiva: {
    borderColor: '#6C63FF',
    borderWidth: 2,
    shadowColor: '#6C63FF',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  equipoFila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'center',
  },
  equipoNombre: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  victoriasTexto: {
    fontSize: 24,
    color: '#6C63FF',
    fontWeight: 'bold',
  },
  versus: {
    fontSize: 14,
    color: '#A0A0C0',
    fontWeight: 'bold',
    letterSpacing: 3,
  },
  minijuegoContenedor: {
    backgroundColor: '#6C63FF20',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#6C63FF',
    width: '100%',
  },
  minijuegoLabel: {
    fontSize: 11,
    color: '#6C63FF',
    letterSpacing: 3,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  minijuegoNombre: {
    fontSize: 22,
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  rondaTexto: {
    fontSize: 13,
    color: '#A0A0C0',
  },
  ganadorContenedor: {
    alignItems: 'center',
    gap: 16,
  },
  trofeo: {
    fontSize: 80,
  },
  ganadorTitulo: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFD700',
    letterSpacing: 4,
  },
  ganadorNombre: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  tuEquipoGano: {
    fontSize: 18,
    color: '#6C63FF',
  },
  esperando: {
    fontSize: 18,
    color: '#A0A0C0',
  },
});
