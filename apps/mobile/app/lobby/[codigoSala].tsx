import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { MotiView } from 'moti';
import { useLocalSearchParams } from 'expo-router';
import { useSalaStore } from '@store/sala.store';
import { useTorneo } from '@hooks/useTorneo';
import { ModalidadEliminatoria } from '@tipos-compartidos';

export default function LobbyScreen(): JSX.Element {
  const params = useLocalSearchParams();
  const codigoSala = String(params.codigoSala ?? '');

  const equipos = useSalaStore((s) => s.equipos);
  const miEquipo = useSalaStore((s) => s.miEquipo);
  
  const { iniciarTorneo } = useTorneo(); // Activar los listeners del torneo en el móvil
  const [modalidad, setModalidad] = useState<ModalidadEliminatoria>(3); // Por defecto al mejor de 3

  const esHost = equipos.length > 0 && miEquipo !== null && equipos[0].id === miEquipo.id;
  const cantidadValida = equipos.length === 2 || equipos.length === 4;

  useEffect(() => {
    // placeholder: could fetch sala inicial si es necesario
  }, [codigoSala]);

  return (
    <View style={styles.container}>
      <MotiView
        from={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'timing', duration: 400 }}
        style={styles.headerCard}
      >
        <Text style={styles.headerLabel}>CÓDIGO DE SALA</Text>
        <Text style={styles.code}>{codigoSala}</Text>
        <Text style={styles.headerSubtitle}>
          Comparte este código para que se unan hasta 4 equipos
        </Text>
      </MotiView>

      <Text style={styles.sectionTitle}>👥 Equipos en la sala ({equipos.length}/4)</Text>

      <FlatList
        data={equipos}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingVertical: 12 }}
        renderItem={({ item, index }) => (
          <MotiView
            from={{ opacity: 0, translateX: -30 }}
            animate={{ opacity: 1, translateX: 0 }}
            transition={{ delay: index * 100 }}
          >
            <View style={[styles.teamCard, item.id === miEquipo?.id && styles.myTeamCard]}>
              <View style={styles.teamCardLeft}>
                <Text style={styles.teamNumber}>#0{index + 1}</Text>
                <Text style={styles.teamName}>{item.nombre}</Text>
              </View>
              {index === 0 && <Text style={styles.hostBadge}>👑 HOST</Text>}
            </View>
          </MotiView>
        )}
      />

      {/* Panel de Configuración para el Anfitrión */}
      {esHost ? (
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 200 }}
          style={styles.settingsCard}
        >
          <Text style={styles.settingsTitle}>⚙️ Configuración del Torneo</Text>
          <Text style={styles.settingsSubtitle}>Formato por ronda (mejor de X juegos):</Text>
          <View style={styles.modalityContainer}>
            {([1, 3, 5] as const).map((value) => (
              <Pressable
                key={value}
                style={[
                  styles.modalityButton,
                  modalidad === value && styles.modalityButtonActive,
                ]}
                onPress={() => setModalidad(value)}
              >
                <Text
                  style={[
                    styles.modalityButtonText,
                    modalidad === value && styles.modalityButtonTextActive,
                  ]}
                >
                  {value === 1 ? '1 Juego' : `${value} Juegos`}
                </Text>
              </Pressable>
            ))}
          </View>
        </MotiView>
      ) : (
        /* Vista de Configuración Pasiva para Invitados */
        <View style={styles.settingsCard}>
          <Text style={styles.settingsTitle}>⚙️ Ajustes de la Partida</Text>
          <Text style={styles.passiveSettingsText}>
            El Host iniciará el torneo al mejor de <Text style={{ color: '#6C63FF', fontWeight: 'bold' }}>{modalidad}</Text> juegos por ronda.
          </Text>
        </View>
      )}

      {/* Indicador Dinámico de Estado */}
      <View style={styles.statusContainer}>
        {equipos.length === 1 ? (
          <Text style={styles.statusTextWaiting}>⏳ Esperando a que se unan más equipos...</Text>
        ) : equipos.length === 3 ? (
          <Text style={styles.statusTextWarning}>⚠️ El torneo requiere exactamente 2 o 4 equipos (actualmente 3).</Text>
        ) : equipos.length === 2 ? (
          <Text style={styles.statusTextReady}>✅ ¡Listo para Final directa (2 equipos)!</Text>
        ) : equipos.length === 4 ? (
          <Text style={styles.statusTextReady}>✅ ¡Listo para Semifinales y Final (4 equipos)!</Text>
        ) : null}
      </View>

      {/* Botón de Lanzamiento (Solo Host) */}
      {esHost ? (
        <Pressable
          style={[
            styles.startButton,
            !cantidadValida && styles.startButtonDisabled,
          ]}
          disabled={!cantidadValida}
          onPress={() => iniciarTorneo(modalidad)}
        >
          <Text style={[styles.startButtonText, !cantidadValida && styles.startButtonTextDisabled]}>
            🏆 Iniciar Torneo
          </Text>
        </Pressable>
      ) : (
        <View style={styles.waitingContainer}>
          <Text style={styles.waitingText}>Esperando que el Host inicie el torneo...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D1A',
    padding: 20,
  },
  headerCard: {
    backgroundColor: '#111122',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#222244',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#6C63FF',
    letterSpacing: 2,
    marginBottom: 6,
  },
  code: {
    fontSize: 54,
    fontWeight: '950',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 4,
    textShadowColor: 'rgba(108, 99, 255, 0.4)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#A0A0C0',
    marginTop: 8,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#A0A0C0',
    marginBottom: 10,
  },
  teamCard: {
    backgroundColor: '#111122',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#1F1F3D',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  myTeamCard: {
    borderColor: '#6C63FF',
    backgroundColor: '#161633',
  },
  teamCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  teamNumber: {
    color: '#6C63FF',
    fontWeight: '800',
    fontSize: 14,
  },
  teamName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  hostBadge: {
    backgroundColor: '#6C63FF',
    color: '#0D0D1A',
    fontWeight: '900',
    fontSize: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    letterSpacing: 0.5,
  },
  settingsCard: {
    backgroundColor: '#111122',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#222244',
    marginTop: 16,
  },
  settingsTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  settingsSubtitle: {
    fontSize: 12,
    color: '#A0A0C0',
    marginBottom: 12,
  },
  passiveSettingsText: {
    fontSize: 14,
    color: '#A0A0C0',
    lineHeight: 20,
  },
  modalityContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  modalityButton: {
    flex: 1,
    backgroundColor: '#070714',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#222244',
  },
  modalityButtonActive: {
    backgroundColor: '#6C63FF',
    borderColor: '#6C63FF',
  },
  modalityButtonText: {
    color: '#A0A0C0',
    fontWeight: '700',
    fontSize: 14,
  },
  modalityButtonTextActive: {
    color: '#0D0D1A',
    fontWeight: '900',
  },
  statusContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  statusTextWaiting: {
    color: '#F1C40F',
    fontWeight: '600',
    fontSize: 13,
  },
  statusTextWarning: {
    color: '#FF6B6B',
    fontWeight: '700',
    fontSize: 13,
    textAlign: 'center',
  },
  statusTextReady: {
    color: '#2ECC71',
    fontWeight: '700',
    fontSize: 13,
  },
  startButton: {
    marginTop: 14,
    backgroundColor: '#6C63FF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  startButtonDisabled: {
    backgroundColor: '#1E1E35',
    shadowOpacity: 0,
  },
  startButtonText: {
    color: '#0D0D1A',
    fontWeight: '900',
    fontSize: 18,
  },
  startButtonTextDisabled: {
    color: '#555577',
  },
  waitingContainer: {
    marginTop: 18,
    alignItems: 'center',
  },
  waitingText: {
    color: '#A0A0C0',
    fontSize: 14,
    fontStyle: 'italic',
  },
});
