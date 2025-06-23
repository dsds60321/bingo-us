import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ScrollView,
  Switch,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { format, isToday, isYesterday, isTomorrow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useTheme } from '../../store/themeStore';

// 🇰🇷 date-fns를 사용한 한국어 로케일 설정
LocaleConfig.locales['ko'] = {
  monthNames: Array.from({ length: 12 }, (_, i) =>
    format(new Date(2024, i, 1), 'MMMM', { locale: ko })
  ),
  monthNamesShort: Array.from({ length: 12 }, (_, i) =>
    format(new Date(2024, i, 1), 'MMM', { locale: ko })
  ),
  dayNames: Array.from({ length: 7 }, (_, i) =>
    format(new Date(2024, 0, i), 'EEEE', { locale: ko })
  ),
  dayNamesShort: Array.from({ length: 7 }, (_, i) =>
    format(new Date(2024, 0, i), 'EEE', { locale: ko })
  ),
  today: '오늘'
};
LocaleConfig.defaultLocale = 'ko';

// 🎨 테마 시스템과 연동된 스타일 생성 함수
const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.surface,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  backButton: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: 20,
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.primary,
  },
  placeholder: {
    width: 40,
  },
  form: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 12,
  },
  titleInput: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: '#333',
    borderWidth: 2,
    borderColor: colors.surfaceVariant,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  descriptionInput: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: '#333',
    height: 100,
    borderWidth: 2,
    borderColor: colors.surfaceVariant,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dateButton: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 2,
    borderColor: colors.surfaceVariant,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dateText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  timeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  timeScrollView: {
    maxHeight: 50,
  },
  timeScrollContent: {
    paddingRight: 20,
  },
  timeOption: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedTimeOption: {
    backgroundColor: colors.accent1,
    borderColor: colors.accent1,
  },
  timeOptionText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  selectedTimeOptionText: {
    color: '#fff',
    fontWeight: '700',
  },
  priorityContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  priorityOption: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  priorityEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  priorityLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
  // 📅 캘린더 모달 스타일
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarContainer: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    margin: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 15,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  closeButton: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: 16,
    padding: 8,
  },
  calendarButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  calendarButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.surfaceVariant,
  },
  confirmButton: {
    backgroundColor: colors.primary,
  },
  calendarButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButtonText: {
    color: '#666',
  },
  confirmButtonText: {
    color: '#fff',
  },
});

export function TodoAddScreen({ navigation }: any) {
  const colors = useTheme();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tempSelectedDate, setTempSelectedDate] = useState(new Date()); // 캘린더에서 임시로 선택된 날짜
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [hasTime, setHasTime] = useState(false);
  const [selectedTime, setSelectedTime] = useState('09:00');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');

  const priorities = [
    { key: 'low', label: '낮음', color: colors.accent2, emoji: '😌' },
    { key: 'medium', label: '보통', color: colors.accent1, emoji: '😊' },
    { key: 'high', label: '높음', color: colors.secondary, emoji: '🔥' },
  ] as const;

  const timeOptions = [
    '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00',
    '19:00', '20:00', '21:00', '22:00'
  ];

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('알림', '할 일 제목을 입력해주세요.');
      return;
    }

    Alert.alert(
      '완료! 🎉',
      '새로운 할 일이 등록되었습니다.',
      [
        { text: '확인', onPress: () => navigation.goBack() }
      ]
    );
  };

  // 📅 date-fns를 사용한 날짜 포맷팅
  const formatDate = (date: Date) => {
    if (isToday(date)) {
      return '오늘 📅';
    } else if (isYesterday(date)) {
      return '어제 📅';
    } else if (isTomorrow(date)) {
      return '내일 📅';
    } else {
      return format(date, 'yyyy년 M월 d일 (EEE)', { locale: ko });
    }
  };

  const handleDateSelect = (day: any) => {
    setTempSelectedDate(new Date(day.dateString));
  };

  const confirmDateSelection = () => {
    setSelectedDate(tempSelectedDate);
    setShowDatePicker(false);
  };

  const cancelDateSelection = () => {
    setTempSelectedDate(selectedDate);
    setShowDatePicker(false);
  };

  const goToDatePicker = () => {
    setTempSelectedDate(selectedDate);
    setShowDatePicker(true);
  };

  const getCalendarTheme = () => ({
    backgroundColor: colors.surface,
    calendarBackground: colors.surface,
    textSectionTitleColor: colors.primary,
    selectedDayBackgroundColor: colors.primary,
    selectedDayTextColor: '#fff',
    todayTextColor: colors.accent1,
    dayTextColor: '#333',
    textDisabledColor: '#ccc',
    arrowColor: colors.primary,
    monthTextColor: colors.primary,
    indicatorColor: colors.primary,
    textDayFontFamily: 'System',
    textMonthFontFamily: 'System',
    textDayHeaderFontFamily: 'System',
    textDayFontWeight: '600',
    textMonthFontWeight: '700',
    textDayHeaderFontWeight: '600',
    textDayFontSize: 16,
    textMonthFontSize: 18,
    textDayHeaderFontSize: 14,
  });

  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>✅ TODO 등록</Text>
          <View style={styles.placeholder} />
        </View>

        {/* 폼 */}
        <View style={styles.form}>
          {/* 제목 입력 */}
          <View style={styles.section}>
            <Text style={styles.label}>할 일 제목 *</Text>
            <TextInput
              style={styles.titleInput}
              placeholder="무엇을 해야 할까요? 😊"
              placeholderTextColor="#B0B0B0"
              value={title}
              onChangeText={setTitle}
              maxLength={50}
            />
          </View>

          {/* 설명 입력 */}
          <View style={styles.section}>
            <Text style={styles.label}>상세 설명</Text>
            <TextInput
              style={styles.descriptionInput}
              placeholder="추가 설명이 있다면 적어주세요 📝"
              placeholderTextColor="#B0B0B0"
              value={description}
              onChangeText={setDescription}
              multiline
              textAlignVertical="top"
              maxLength={200}
            />
          </View>

          {/* 날짜 선택 */}
          <View style={styles.section}>
            <Text style={styles.label}>날짜</Text>
            <TouchableOpacity style={styles.dateButton} onPress={goToDatePicker}>
              <Icon name="calendar-today" size={20} color={colors.primary} />
              <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
              <Icon name="chevron-right" size={20} color="#B0B0B0" />
            </TouchableOpacity>
          </View>

          {/* 시간 설정 */}
          <View style={styles.section}>
            <View style={styles.timeHeader}>
              <Text style={styles.label}>시간 설정</Text>
              <Switch
                value={hasTime}
                onValueChange={setHasTime}
                trackColor={{ false: '#E0E0E0', true: colors.primaryLight }}
                thumbColor={hasTime ? colors.primary : '#B0B0B0'}
              />
            </View>

            {hasTime && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.timeScrollView}
                contentContainerStyle={styles.timeScrollContent}
              >
                {timeOptions.map(time => (
                  <TouchableOpacity
                    key={time}
                    style={[
                      styles.timeOption,
                      selectedTime === time && styles.selectedTimeOption
                    ]}
                    onPress={() => setSelectedTime(time)}
                  >
                    <Text style={[
                      styles.timeOptionText,
                      selectedTime === time && styles.selectedTimeOptionText
                    ]}>
                      {time}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>

          {/* 우선순위 */}
          <View style={styles.section}>
            <Text style={styles.label}>우선순위</Text>
            <View style={styles.priorityContainer}>
              {priorities.map(item => (
                <TouchableOpacity
                  key={item.key}
                  style={[
                    styles.priorityOption,
                    { backgroundColor: priority === item.key ? item.color : colors.surfaceVariant }
                  ]}
                  onPress={() => setPriority(item.key)}
                >
                  <Text style={styles.priorityEmoji}>{item.emoji}</Text>
                  <Text style={[
                    styles.priorityLabel,
                    { color: priority === item.key ? '#fff' : '#666' }
                  ]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 저장 버튼 */}
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Icon name="check" size={24} color="#fff" />
            <Text style={styles.saveButtonText}>할 일 등록하기</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* 📅 날짜 선택 모달 */}
      <Modal
        visible={showDatePicker}
        transparent={true}
        animationType="fade"
        onRequestClose={cancelDateSelection}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.calendarContainer}>
            <View style={styles.calendarHeader}>
              <Text style={styles.calendarTitle}>📅 날짜 선택</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={cancelDateSelection}
              >
                <Icon name="close" size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>

            <Calendar
              current={format(tempSelectedDate, 'yyyy-MM-dd')}
              onDayPress={handleDateSelect}
              minDate={format(new Date(), 'yyyy-MM-dd')} // 오늘부터 선택 가능 (TODO는 미래 날짜)
              monthFormat={'yyyy년 M월'}
              theme={getCalendarTheme()}
              markedDates={{
                [format(tempSelectedDate, 'yyyy-MM-dd')]: {
                  selected: true,
                  selectedColor: colors.primary,
                },
              }}
              style={{
                borderRadius: 12,
              }}
            />

            <View style={styles.calendarButtons}>
              <TouchableOpacity
                style={[styles.calendarButton, styles.cancelButton]}
                onPress={cancelDateSelection}
              >
                <Text style={[styles.calendarButtonText, styles.cancelButtonText]}>
                  취소
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.calendarButton, styles.confirmButton]}
                onPress={confirmDateSelection}
              >
                <Text style={[styles.calendarButtonText, styles.confirmButtonText]}>
                  확인
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
