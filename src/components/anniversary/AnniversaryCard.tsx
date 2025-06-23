import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Anniversary } from '../../types';

interface AnniversaryCardProps {
  anniversary: Anniversary;
  style?: ViewStyle;
}

export function AnniversaryCard({ anniversary, style }: AnniversaryCardProps) {
  // D-Day 계산
  const calculateDDay = (dateString: string) => {
    const targetDate = new Date(dateString);
    const today = new Date();
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'D-Day';
    if (diffDays > 0) return `D-${diffDays}`;
    return `D+${Math.abs(diffDays)}`;
  };

  // 이모지 선택
  const getEmoji = (type: string) => {
    switch (type) {
      case 'anniversary': return '💕';
      case 'birthday': return '🎂';
      case 'custom': return '🎉';
      default: return '📅';
    }
  };

  const dDay = calculateDDay(anniversary.date);

  return (
    <View style={[styles.card, style]}>
      <View style={styles.header}>
        <Text style={styles.emoji}>{getEmoji(anniversary.type)}</Text>
        <Text style={styles.dday}>{dDay}</Text>
      </View>
      <Text style={styles.title} numberOfLines={2}>
        {anniversary.title}
      </Text>
      <Text style={styles.date}>{anniversary.date}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: 150,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  emoji: {
    fontSize: 20,
  },
  dday: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    lineHeight: 20,
  },
  date: {
    fontSize: 12,
    color: '#666',
  },
});
