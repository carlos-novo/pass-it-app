import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable } from 'react-native';
import { MotiView } from 'moti';
import useSala from '@hooks/useSala';

export default function CrearScreen(): JSX.Element {
  const [nombreEquipo, setNombreEquipo] = useState('Equipo Alpha');
  const { crearSala, ultimoError } = useSala();

  const confirmar = () => {
    const nombre = nombreEquipo.trim();
    if (nombre.length === 0) return;
    crearSala(nombre);
  };

  return (
    <View style={styles.container}>
      <MotiView
        from={{ opacity: 0, translateY: 10 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ duration: 500 }}
        style={styles.card}
      >
        <Text style={styles.title}>🎉 Crear Nueva Sala</Text>
        <Text style={styles.subtitle}>
          Se generará un código de 6 caracteres para que tus amigos puedan unirse a tu partida.
        </Text>

        <Text style={styles.label}>Nombre de tu equipo</Text>
        <TextInput
          style={styles.input}
          value={nombreEquipo}
          onChangeText={setNombreEquipo}
          placeholder="Escribe el nombre de tu equipo..."
          placeholderTextColor="#555"
        />

        {ultimoError ? <Text style={styles.error}>{ultimoError.mensaje}</Text> : null}

        <Pressable style={styles.button} onPress={confirmar}>
          <Text style={styles.buttonText}>✨ Crear Sala</Text>
        </Pressable>
      </MotiView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D1A',
    padding: 24,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#111122',
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#222244',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#A0A0C0',
    marginBottom: 24,
    lineHeight: 20,
  },
  label: {
    color: '#6C63FF',
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '700',
  },
  input: {
    height: 56,
    backgroundColor: '#070714',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#222244',
    paddingHorizontal: 16,
    color: '#FFFFFF',
    fontSize: 18,
  },
  button: {
    marginTop: 24,
    backgroundColor: '#6C63FF',
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 12,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonText: {
    color: '#0D0D1A',
    fontWeight: '800',
    fontSize: 18,
  },
  error: {
    color: '#FF6B6B',
    marginTop: 12,
    fontWeight: '600',
  },
});
