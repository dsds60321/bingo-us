import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export function RoutesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>경로 화면</Text>
      <Text style={styles.subtitle}>곧 구현될 예정입니다!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
});
