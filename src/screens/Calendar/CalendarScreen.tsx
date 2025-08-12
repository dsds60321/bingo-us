import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAppStore } from '../../store/appStore';
import { useTheme } from '../../store/themeStore';
import { format } from 'date-fns';

// 데이터 타입별 색상 정의
const eventColors = {
  anniversary: '#FF6B6B',    // 빨간색 - 기념일
  schedule: '#4ECDC4',       // 청록색 - 일정
  budget: '#45B7D1',         // 파란색 - 예산
  reflection: '#96CEB4',     // 연두색 - 반성문
};

// 캘린더 이벤트 타입 정의
interface CalendarEvent {
  id: string;
  type: 'anniversary' | 'schedule' | 'budget' | 'reflection';
  title: string;
  date: string;
  description?: string;
  amount?: number;
  location?: string;
  status?: string;
  category?: string;
  author?: string;
}

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
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 16,
    gap: 6,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  todoButton: { backgroundColor: eventColors.schedule },
  anniversaryButton: { backgroundColor: eventColors.anniversary },
  budgetButton: { backgroundColor: eventColors.budget },
  reflectionButton: { backgroundColor: eventColors.reflection },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
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
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 20,
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  // 모달 스타일
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    margin: 20,
    maxHeight: '70%',
    minWidth: '85%',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceVariant,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: colors.surfaceVariant,
  },
  modalContent: {
    maxHeight: 400,
  },
  eventSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionIcon: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  eventItem: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  eventDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  eventMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  eventMetaText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  eventAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: eventColors.budget,
  },
});

export function CalendarScreen({ navigation }: any) {
  const colors = useTheme();
  const {
    schedules,
    anniversaries,
    budgetItems,
    reflections
  } = useAppStore();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedDateEvents, setSelectedDateEvents] = useState<CalendarEvent[]>([]);

  const styles = createStyles(colors);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // 모든 데이터를 캘린더 이벤트로 변환하는 함수
  const convertToCalendarEvents = (): CalendarEvent[] => {
    const events: CalendarEvent[] = [];

    // 기념일 변환
    if (anniversaries && anniversaries.length > 0) {
      anniversaries.forEach(anniversary => {
        events.push({
          id: `anniversary-${anniversary.id}`,
          type: 'anniversary',
          title: anniversary.title,
          date: anniversary.date,
          description: anniversary.description,
        });
      });
    }

    // 일정 변환
    if (schedules && schedules.length > 0) {
      schedules.forEach(schedule => {
        events.push({
          id: `schedule-${schedule.id}`,
          type: 'schedule',
          title: schedule.title,
          date: schedule.dueDate || schedule.createdAt?.split('T')[0] || format(new Date(), 'yyyy-MM-dd'),
          description: schedule.description,
          status: schedule.completed ? '완료' : '진행중',
        });
      });
    }

    // 예산 변환
    if (budgetItems && budgetItems.length > 0) {
      budgetItems.forEach(budget => {
        console.log('--- budget date', budget.expenseDate)
        events.push({
          id: `budget-${budget.id}`,
          type: 'budget',
          title: budget.title,
          date: budget.expenseDate,
          description: budget.description,
          amount: budget.amount,
          location: budget.location,
          category: budget.category,
          author: budget.paidBy,
        });
      });
    }

    // 반성문 변환
    if (reflections && reflections.length > 0) {
      reflections.forEach((reflection, index) => {
        events.push({
          id: `reflection-${reflection.id || index}`,
          type: 'reflection',
          title: reflection.incident,
          date: reflection.created_at?.split('T')[0] || format(new Date(), 'yyyy-MM-dd'),
          description: reflection.reason,
          status: reflection.status,
          author: reflection.authorUserId,
        });
      });
    }

    return events;
  };

  const allEvents = convertToCalendarEvents();

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

  // 해당 날짜의 이벤트들을 가져오는 함수
  const getEventsForDate = (date: Date): CalendarEvent[] => {
    const dateString = format(date, 'yyyy-MM-dd');
    return allEvents.filter(event => event.date === dateString);
  };

  // 해당 날짜의 이벤트 타입별로 표시할 인디케이터 가져오기
  const getEventIndicators = (date: Date) => {
    const events = getEventsForDate(date);
    const eventTypes = [...new Set(events.map(event => event.type))];
    return eventTypes;
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
    const events = getEventsForDate(date);

    if (events.length > 0) {
      setSelectedDateEvents(events);
      setShowEventModal(true);
    }
  };

  // 이벤트 모달을 렌더링하는 함수
  const renderEventModal = () => {
    if (!selectedDate || selectedDateEvents.length === 0) return null;

    const groupedEvents = {
      anniversary: selectedDateEvents.filter(e => e.type === 'anniversary'),
      schedule: selectedDateEvents.filter(e => e.type === 'schedule'),
      budget: selectedDateEvents.filter(e => e.type === 'budget'),
      reflection: selectedDateEvents.filter(e => e.type === 'reflection'),
    };

    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('ko-KR', {
        style: 'currency',
        currency: 'KRW'
      }).format(amount);
    };

    const sectionTitles = {
      anniversary: '🎉 기념일',
      schedule: '📝 일정',
      budget: '💰 예산',
      reflection: '📄 반성문',
    };

    return (
      <Modal
        visible={showEventModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEventModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedDate.toLocaleDateString('ko-KR', {
                  month: 'long',
                  day: 'numeric',
                  weekday: 'long'
                })}
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowEventModal(false)}
              >
                <Icon name="close" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              {Object.entries(groupedEvents).map(([type, events]) => {
                if (events.length === 0) return null;

                return (
                  <View key={type} style={styles.eventSection}>
                    <View style={styles.sectionTitle}>
                      <View
                        style={[
                          styles.sectionIcon,
                          { backgroundColor: eventColors[type as keyof typeof eventColors] }
                        ]}
                      />
                      <Text style={styles.sectionTitle}>
                        {sectionTitles[type as keyof typeof sectionTitles]}
                      </Text>
                    </View>

                    {events.map((event) => (
                      <View key={event.id} style={styles.eventItem}>
                        <Text style={styles.eventTitle}>{event.title}</Text>

                        {event.description && (
                          <Text style={styles.eventDescription}>
                            {event.description}
                          </Text>
                        )}

                        <View style={styles.eventMeta}>
                          <View>
                            {event.location && (
                              <Text style={styles.eventMetaText}>📍 {event.location}</Text>
                            )}
                            {event.author && (
                              <Text style={styles.eventMetaText}>👤 {event.author}</Text>
                            )}
                            {event.status && (
                              <Text style={styles.eventMetaText}>📊 {event.status}</Text>
                            )}
                            {event.category && (
                              <Text style={styles.eventMetaText}>🏷️ {event.category}</Text>
                            )}
                          </View>

                          {event.amount && (
                            <Text style={styles.eventAmount}>
                              {formatCurrency(event.amount)}
                            </Text>
                          )}
                        </View>
                      </View>
                    ))}
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  const calendarDays = generateCalendarDays();
  const dayNames = getDayNames();
  const monthYearText = getMonthName(currentYear, currentMonth);
  const today = new Date();

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
          onPress={() => navigation.navigate('TodoAdd')}
        >
          <Icon name="checklist" size={18} color="#fff" />
          <Text style={styles.actionButtonText}>일정</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.anniversaryButton]}
          onPress={() => navigation.navigate('AnniversaryAdd')}
        >
          <Icon name="celebration" size={18} color="#fff" />
          <Text style={styles.actionButtonText}>기념일</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.budgetButton]}
          onPress={() => navigation.navigate('BudgetAdd')}
        >
          <Icon name="account-balance-wallet" size={18} color="#fff" />
          <Text style={styles.actionButtonText}>예산</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.reflectionButton]}
          onPress={() => navigation.navigate('Reflection')}
        >
          <Icon name="assignment" size={18} color="#fff" />
          <Text style={styles.actionButtonText}>반성문</Text>
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
            const eventTypes = getEventIndicators(date);

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
                    {eventTypes.map((eventType) => (
                      <View
                        key={eventType}
                        style={[
                          styles.indicator,
                          { backgroundColor: eventColors[eventType] }
                        ]}
                      />
                    ))}
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
          <View style={[styles.legendDot, { backgroundColor: eventColors.schedule }]} />
          <Text style={styles.legendText}>일정</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: eventColors.anniversary }]} />
          <Text style={styles.legendText}>기념일</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: eventColors.budget }]} />
          <Text style={styles.legendText}>예산</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: eventColors.reflection }]} />
          <Text style={styles.legendText}>반성문</Text>
        </View>
      </View>

      {/* 이벤트 모달 */}
      {renderEventModal()}
    </SafeAreaView>
  );
}
