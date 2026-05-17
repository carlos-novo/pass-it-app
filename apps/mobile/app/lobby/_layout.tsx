import React from 'react';
import { View, StyleSheet } from 'react-native';

export const metadata = {
  title: 'Lobby',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <View style={styles.container}>{children}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D1A',
    padding: 16,
  },
});
