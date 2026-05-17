import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable } from 'react-native';
import { MotiView } from 'moti';
import useSala from '@hooks/useSala';
import { useRouter } from 'expo-router';

export default function UnirseScreen(): JSX.Element {
  const [codigo, setCodigo] = useState('');
  const [nombreEquipo, setNombreEquipo] = useState('Equipo');
  const { unirseASala, ultimoError } = useSala();
  const router = useRouter();

  const confirmar = () => {
    const c = codigo.trim().toUpperCase();
    if (c.length !== 6) return;
    unirseASala(c, nombreEquipo);
  };

  return (
    <View style={styles.container}>
      <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 500 }}>
        <Text style={styles.label}>Código de sala</Text>
        <TextInput
          style={styles.input}
          value={codigo}
          onChangeText={(t) => setCodigo(t.toUpperCase())}
          autoCapitalize="characters"
          maxLength={6}
          placeholder="ABC123"
          placeholderTextColor="#555"
        />

        <Text style={[styles.label, { marginTop: 16 }]}>Nombre de tu equipo</Text>
        <TextInput style={styles.input} value={nombreEquipo} onChangeText={setNombreEquipo} />

        {ultimoError ? <Text style={styles.error}>{ultimoError.mensaje}</Text> : null}

        <Pressable style={styles.button} onPress={confirmar}>
          <Text style={styles.buttonText}>🔓 Unirse</Text>
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
  },
  label: {
    color: '#A0A0C0',
    marginBottom: 8,
    fontSize: 14,
  },
  input: {
    height: 56,
    backgroundColor: '#0F0F1A',
    borderRadius: 10,
    paddingHorizontal: 16,
    color: '#FFFFFF',
    fontSize: 18,
  },
  button: {
    marginTop: 24,
    backgroundColor: '#6C63FF',
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 10,
  },
  buttonText: {
    color: '#0D0D1A',
    fontWeight: '700',
    fontSize: 16,
  },
  error: {
    color: '#FF6B6B',
    marginTop: 12,
  },
});
