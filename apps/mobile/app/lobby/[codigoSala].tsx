import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { MotiView } from 'moti';
import { useLocalSearchParams } from 'expo-router';
import { useSalaStore } from '@store/sala.store';

export default function LobbyScreen(): JSX.Element {
  const params = useLocalSearchParams();
  const codigoSala = String(params.codigoSala ?? '');

  const equipos = useSalaStore((s) => s.equipos);
  const miEquipo = useSalaStore((s) => s.miEquipo);

  const esHost = equipos.length > 0 && miEquipo !== null && equipos[0].id === miEquipo.id;

  useEffect(() => {
    // placeholder: could fetch sala inicial si es necesario
  }, [codigoSala]);

  return (
    <View style={styles.container}>
      <Text style={styles.code}>{codigoSala}</Text>

      <FlatList
        data={equipos}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingVertical: 12 }}
        renderItem={({ item, index }) => (
          <MotiView from={{ opacity: 0, translateX: -20 }} animate={{ opacity: 1, translateX: 0 }} transition={{ delay: index * 80 }}>
            <View style={styles.teamCard}>
              <Text style={styles.teamName}>{item.nombre}</Text>
            </View>
          </MotiView>
        )}
      />

      {esHost && equipos.length >= 2 ? (
        <Pressable style={styles.startButton}>
          <Text style={styles.startButtonText}>🏆 Iniciar Torneo</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  code: {
    fontSize: 44,
    fontWeight: '900',
    color: '#6C63FF',
    textAlign: 'center',
    marginBottom: 16,
  },
  teamCard: {
    backgroundColor: '#0F0F1A',
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
  },
  teamName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  startButton: {
    marginTop: 12,
    backgroundColor: '#6C63FF',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#0D0D1A',
    fontWeight: '800',
    fontSize: 16,
  },
});
