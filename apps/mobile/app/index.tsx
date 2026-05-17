import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MotiView } from 'moti';
import { useRouter } from 'expo-router';

export default function HomeScreen(): JSX.Element {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <MotiView
        from={{ opacity: 0, translateY: -20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 700 }}
      >
        <Text style={styles.title}>🎉 Pass It</Text>
      </MotiView>

      <Text style={styles.subtitle}>El Party Game más frenético</Text>

      <View style={styles.actions}>
        <Pressable style={styles.button} onPress={() => router.push('/unirse')}>
          <Text style={styles.buttonText}>🔑 Unirse a Sala</Text>
        </Pressable>

        <Pressable style={[styles.button, styles.buttonPrimary]} onPress={() => router.push('/unirse')}>
          <Text style={[styles.buttonText, styles.buttonTextPrimary]}>🎉 Crear Sala</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D1A',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 56,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 1,
    marginBottom: 8,
  },
  subtitle: {
    color: '#A0A0C0',
    marginBottom: 32,
    fontSize: 16,
  },
  actions: {
    width: '100%',
    gap: 12,
  },
  button: {
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#1A1A2B',
    alignItems: 'center',
  },
  buttonPrimary: {
    backgroundColor: '#6C63FF',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  buttonTextPrimary: {
    color: '#0D0D1A',
  },
});
