import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Schedule } from '../../types';

interface UpcomingSchedulesProps {
  schedules: Schedule[];
  title: string;
  emptyMessage: string;
  onPress: () => void;
}

export function UpcomingSchedules({ schedules, title, emptyMessage, onPress }: UpcomingSchedulesProps) {
  if (schedules.length === 0 && emptyMessage) {
    return (
      <TouchableOpacity style={styles.emptyContainer} onPress={onPress}>
        <Icon name="event-available" size={32} color="#ccc" />
        <Text style={styles.emptyText}>{emptyMessage}</Text>
        <Text style={styles.addText}>일정 추가하기</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      {schedules.map((schedule) => (
        <TouchableOpacity key={schedule.id} style={styles.scheduleItem} onPress={onPress}>
          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>{schedule.time || '종일'}</Text>
          </View>
          <View style={styles.contentContainer}>
            <Text style={styles.titleText}>{schedule.title}</Text>
            {schedule.location && (
              <Text style={styles.locationText}>{schedule.location}</Text>
            )}
          </View>
          <Icon name="chevron-right" size={20} color="#ccc" />
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  emptyContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 30,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
    marginBottom: 5,
  },
  addText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  timeContainer: {
    width: 60,
    alignItems: 'center',
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  contentContainer: {
    flex: 1,
    marginLeft: 15,
  },
  titleText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  locationText: {
    fontSize: 14,
    color: '#666',
  },
});
