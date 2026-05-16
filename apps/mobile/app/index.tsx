import { Text, View, StyleSheet } from 'react-native';

/**
 * Pantalla de inicio temporal (placeholder).
 * Se sustituirá por la pantalla real del Lobby en el Módulo 2.
 */
export default function PantallaInicio(): JSX.Element {
  return (
    <View style={estilos.contenedor}>
      <Text style={estilos.titulo}>🎉 Pass It</Text>
      <Text style={estilos.subtitulo}>El Party Game más frenético</Text>
      <Text style={estilos.info}>Módulo 1 completado ✅</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: '#0D0D1A',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  titulo: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  subtitulo: {
    fontSize: 18,
    color: '#A0A0C0',
    marginBottom: 32,
    textAlign: 'center',
  },
  info: {
    fontSize: 14,
    color: '#6C63FF',
  },
});
