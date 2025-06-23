import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useTheme } from '../store/themeStore';

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    fontSize: 64,
    marginBottom: 24,
  },
  appName: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  spinnerContainer: {
    marginBottom: 16,
  },
  spinner: {
    transform: [{ scale: 1.2 }],
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
});

export function LoadingSpinner() {
  const colors = useTheme();
  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentContainer}>
        <Text style={styles.logo}>💕</Text>
        <Text style={styles.appName}>커플 다이어리</Text>
        <Text style={styles.subtitle}>
          소중한 사람과 함께하는{'\n'}특별한 순간들을 기록해보세요
        </Text>

        <View style={styles.spinnerContainer}>
          <ActivityIndicator
            size="large"
            color={colors.primary}
            style={styles.spinner}
          />
        </View>

        <Text style={styles.loadingText}>로그인 중...</Text>
      </View>
    </SafeAreaView>
  );
}
