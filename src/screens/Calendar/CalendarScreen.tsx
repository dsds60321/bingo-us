import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAppStore } from '../../store/appStore';
import { useTheme } from '../../store/themeStore';

// 🎨 테마 시스템과 연동된 스타일 생성 함수
const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: colors.surface,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  headerLeft: {
    flex: 1,
  },
  yearMonth: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.primary,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  navButton: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: 20,
    padding: 8,
  },
  todayButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  todayButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 20,
    gap: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  todoButton: {
    backgroundColor: colors.accent1,
  },
  anniversaryButton: {
    backgroundColor: colors.accent2,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  calendar: {
    flex: 1,
    backgroundColor: colors.surface,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 24,
    padding: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  weekHeader: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: colors.surfaceVariant,
  },
  dayHeader: {
    flex: 1,
    alignItems: 'center',
  },
  dayHeaderText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#8B8B8B',
  },
  sundayText: {
    color: colors.primary,
  },
  saturdayText: {
    color: colors.secondary,
  },
  datesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dateWrapper: {
    width: '14.28%',
    alignItems: 'center',
    paddingVertical: 2,
  },
  dateItem: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  todayItem: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  selectedItem: {
    backgroundColor: colors.surfaceVariant,
    borderWidth: 2,
    borderColor: colors.secondary,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  otherMonthText: {
    color: '#D0D0D0',
  },
  todayText: {
    color: '#fff',
    fontWeight: '800',
  },
  selectedText: {
    color: colors.secondary,
    fontWeight: '800',
  },
  indicators: {
    position: 'absolute',
    bottom: -8,
    flexDirection: 'row',
    gap: 2,
  },
  indicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  scheduleIndicator: {
    backgroundColor: colors.accent1,
  },
  anniversaryIndicator: {
    backgroundColor: colors.accent2,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 32,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  legendText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
});

export function CalendarScreen({ navigation }: any) {
  const colors = useTheme();
  const { schedules, anniversaries } = useAppStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // 한국어 요일 이름을 동적으로 생성
  const getDayNames = () => {
    const baseDate = new Date(2024, 0, 7); // 2024년 1월 7일 (일요일)
    const dayNames = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(baseDate);
      date.setDate(baseDate.getDate() + i);
      dayNames.push(
        date.toLocaleDateString('ko-KR', { weekday: 'short' })
      );
    }

    return dayNames;
  };

  // 월 이름을 동적으로 생성
  const getMonthName = (year: number, month: number) => {
    const date = new Date(year, month, 1);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long'
    });
  };

  // 달력 날짜 생성
  const generateCalendarDays = () => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const startDate = new Date(firstDay);

    // 첫 주의 시작을 일요일로 맞추기
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const current = new Date(startDate);

    // 6주치 날짜 생성 (42일)
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return days;
  };

  // 해당 날짜에 일정이 있는지 확인
  const hasSchedule = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return schedules.some(schedule => schedule.date === dateString);
  };

  // 해당 날짜에 기념일이 있는지 확인
  const hasAnniversary = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return anniversaries.some(anniversary => anniversary.date === dateString);
  };

  // 이전 달로 이동
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  // 다음 달로 이동
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  // 오늘로 이동
  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // 날짜 클릭 처리
  const handleDatePress = (date: Date) => {
    setSelectedDate(date);

    const dateString = date.toISOString().split('T')[0];
    const daySchedules = schedules.filter(schedule => schedule.date === dateString);
    const dayAnniversaries = anniversaries.filter(anniversary => anniversary.date === dateString);

    if (daySchedules.length > 0 || dayAnniversaries.length > 0) {
      // 날짜 포맷팅을 한국어로
      const formattedDate = date.toLocaleDateString('ko-KR', {
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      });

      let message = `📅 ${formattedDate}\n\n`;

      if (dayAnniversaries.length > 0) {
        message += '🎉 기념일:\n';
        dayAnniversaries.forEach(ann => {
          message += `• ${ann.title}\n`;
        });
        message += '\n';
      }

      if (daySchedules.length > 0) {
        message += '📝 일정:\n';
        daySchedules.forEach(schedule => {
          message += `• ${schedule.time || '종일'} ${schedule.title}\n`;
          if (schedule.location) {
            message += `  📍 ${schedule.location}\n`;
          }
        });
      }

      Alert.alert('일정 정보', message);
    }
  };

  // TODO 버튼 클릭
  const handleTodoPress = () => {
    navigation.navigate('TodoAdd');
  };

  // 기념일 등록 버튼 클릭
  const handleAnniversaryPress = () => {
    navigation.navigate('AnniversaryAdd');
  };

  const calendarDays = generateCalendarDays();
  const dayNames = getDayNames();
  const monthYearText = getMonthName(currentYear, currentMonth);
  const today = new Date();

  // 테마 기반 스타일 적용
  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.yearMonth}>
            {monthYearText}
          </Text>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.todayButton}
            onPress={goToToday}
          >
            <Text style={styles.todayButtonText}>오늘</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={goToPreviousMonth} style={styles.navButton}>
            <Icon name="chevron-left" size={28} color={colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}>
            <Icon name="chevron-right" size={28} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* 액션 버튼들 */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.todoButton]}
          onPress={handleTodoPress}
        >
          <Icon name="checklist" size={22} color="#fff" />
          <Text style={styles.actionButtonText}>TODO</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.anniversaryButton]}
          onPress={handleAnniversaryPress}
        >
          <Icon name="celebration" size={22} color="#fff" />
          <Text style={styles.actionButtonText}>기념일 등록</Text>
        </TouchableOpacity>
      </View>

      {/* 달력 */}
      <View style={styles.calendar}>
        {/* 요일 헤더 */}
        <View style={styles.weekHeader}>
          {dayNames.map((day, index) => (
            <View key={`${day}-${index}`} style={styles.dayHeader}>
              <Text style={[
                styles.dayHeaderText,
                index === 0 && styles.sundayText,
                index === 6 && styles.saturdayText,
              ]}>
                {day}
              </Text>
            </View>
          ))}
        </View>

        {/* 날짜들 */}
        <View style={styles.datesContainer}>
          {calendarDays.map((date, index) => {
            const isCurrentMonth = date.getMonth() === currentMonth;
            const isToday =
              date.getDate() === today.getDate() &&
              date.getMonth() === today.getMonth() &&
              date.getFullYear() === today.getFullYear();
            const isSelected =
              selectedDate &&
              date.getDate() === selectedDate.getDate() &&
              date.getMonth() === selectedDate.getMonth() &&
              date.getFullYear() === selectedDate.getFullYear();
            const dayOfWeek = index % 7;
            const isSunday = dayOfWeek === 0;
            const isSaturday = dayOfWeek === 6;
            const hasEvent = hasSchedule(date);
            const hasSpecialDay = hasAnniversary(date);

            return (
              <View key={`${date.toISOString()}-${index}`} style={styles.dateWrapper}>
                <TouchableOpacity
                  style={[
                    styles.dateItem,
                    isToday && styles.todayItem,
                    isSelected && styles.selectedItem,
                  ]}
                  onPress={() => handleDatePress(date)}
                  disabled={!isCurrentMonth}
                >
                  <Text style={[
                    styles.dateText,
                    !isCurrentMonth && styles.otherMonthText,
                    isToday && styles.todayText,
                    isSelected && styles.selectedText,
                    isSunday && !isToday && !isSelected && styles.sundayText,
                    isSaturday && !isToday && !isSelected && styles.saturdayText,
                  ]}>
                    {date.getDate()}
                  </Text>

                  {/* 이벤트 인디케이터 */}
                  <View style={styles.indicators}>
                    {hasEvent && (
                      <View style={[styles.indicator, styles.scheduleIndicator]} />
                    )}
                    {hasSpecialDay && (
                      <View style={[styles.indicator, styles.anniversaryIndicator]} />
                    )}
                  </View>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </View>

      {/* 하단 범례 */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.scheduleIndicator]} />
          <Text style={styles.legendText}>일정</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.anniversaryIndicator]} />
          <Text style={styles.legendText}>기념일</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
