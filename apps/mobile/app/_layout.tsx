import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';

/**
 * Layout raíz de la aplicación.
 * Configura la navegación y los proveedores globales.
 */
export default function LayoutRaiz(): JSX.Element {
  return (
    <GestureHandlerRootView style={estilos.contenedor}>
      <StatusBar style="light" backgroundColor="#0D0D1A" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#0D0D1A' },
          animation: 'fade',
        }}
      />
    </GestureHandlerRootView>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
  },
});
