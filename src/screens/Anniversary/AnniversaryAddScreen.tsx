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
import { CustomScrollView } from '../../components/CustomScrollView.tsx';
import { anniversaryService, CreateAnniversaryRequest } from '../../services/AnniversaryService';

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
  typeContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  typeOption: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  typeEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  typeLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  exampleContainer: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  exampleLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  exampleText: {
    fontSize: 14,
    color: '#999',
    flex: 1,
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
  recurringHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recurringInfo: {
    flex: 1,
  },
  recurringSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
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
  previewContainer: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  previewEmoji: {
    fontSize: 24,
  },
  previewCard: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  previewCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  previewCardDate: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  previewCardRecurring: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
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
  saveButtonDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
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

export function AnniversaryAddScreen({ navigation }: any) {
  const colors = useTheme();
  const [title, setTitle] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tempSelectedDate, setTempSelectedDate] = useState(new Date()); // 캘린더에서 임시로 선택된 날짜
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [type, setType] = useState<'anniversary' | 'birthday' | 'special'>('anniversary');
  const [isRecurring, setIsRecurring] = useState(true);
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const anniversaryTypes = [
    {
      key: 'anniversary',
      label: '기념일',
      emoji: '💕',
      color: colors.accent1,
      examples: ['사귄 날', '결혼 기념일', '첫 만남'],
      apiType: 'ANNIVERSARY' as const,
    },
    {
      key: 'birthday',
      label: '생일',
      emoji: '🎂',
      color: colors.accent2,
      examples: ['내 생일', '상대방 생일', '가족 생일'],
      apiType: 'BIRTHDAY' as const,
    },
    {
      key: 'special',
      label: '특별한 날',
      emoji: '🎉',
      color: colors.secondary,
      examples: ['크리스마스', '발렌타인데이', '화이트데이'],
      apiType: 'CUSTOM' as const,
    },
  ] as const;

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('알림', '기념일 이름을 입력해주세요.');
      return;
    }

    setIsLoading(true);

    try {
      const selectedTypeInfo = anniversaryTypes.find(t => t.key === type)!;

      const anniversaryData: CreateAnniversaryRequest = {
        type: selectedTypeInfo.apiType,
        title: title.trim(),
        date: format(selectedDate, 'yyyy-MM-dd'),
        isContinue: isRecurring ? 1 : 0,
        isPrivate: 0, // 고정값
        description: description.trim() || undefined,
      };

      console.log('Sending anniversary data:', anniversaryData);

      const response = await anniversaryService.createAnniversary(anniversaryData);

      if (response.success) {
        Alert.alert(
          '완료! 🎉',
          '새로운 기념일이 등록되었습니다.',
          [
            { text: '확인', onPress: () => navigation.goBack() }
          ]
        );
      } else {
        Alert.alert('등록 실패', response.message || '기념일 등록에 실패했습니다.');
      }
    } catch (error) {
      console.error('Anniversary save error:', error);
      Alert.alert('오류', '기념일 등록 중 문제가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
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

  const selectedTypeInfo = anniversaryTypes.find(t => t.key === type)!;
  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.container}>
      <CustomScrollView showsVerticalScrollIndicator={false}>
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>🎉 기념일 등록</Text>
          <View style={styles.placeholder} />
        </View>

        {/* 폼 */}
        <View style={styles.form}>
          {/* 기념일 유형 */}
          <View style={styles.section}>
            <Text style={styles.label}>기념일 유형</Text>
            <View style={styles.typeContainer}>
              {anniversaryTypes.map(item => (
                <TouchableOpacity
                  key={item.key}
                  style={[
                    styles.typeOption,
                    {
                      backgroundColor: type === item.key ? item.color : colors.surfaceVariant,
                      borderColor: type === item.key ? item.color : 'transparent',
                    }
                  ]}
                  onPress={() => setType(item.key)}
                  disabled={isLoading}
                >
                  <Text style={styles.typeEmoji}>{item.emoji}</Text>
                  <Text style={[
                    styles.typeLabel,
                    { color: type === item.key ? '#fff' : '#666' }
                  ]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* 선택된 유형의 예시 */}
            <View style={styles.exampleContainer}>
              <Text style={styles.exampleLabel}>예시: </Text>
              <Text style={styles.exampleText}>
                {selectedTypeInfo.examples.join(', ')}
              </Text>
            </View>
          </View>

          {/* 기념일 이름 */}
          <View style={styles.section}>
            <Text style={styles.label}>기념일 이름 *</Text>
            <TextInput
              style={styles.titleInput}
              placeholder={`${selectedTypeInfo.emoji} 어떤 기념일인가요?`}
              placeholderTextColor="#B0B0B0"
              value={title}
              onChangeText={setTitle}
              maxLength={30}
              editable={!isLoading}
            />
          </View>

          {/* 날짜 선택 */}
          <View style={styles.section}>
            <Text style={styles.label}>날짜</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={goToDatePicker}
              disabled={isLoading}
            >
              <Icon name="calendar-today" size={20} color={colors.primary} />
              <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
              <Icon name="chevron-right" size={20} color="#B0B0B0" />
            </TouchableOpacity>
          </View>

          {/* 매년 반복 설정 */}
          <View style={styles.section}>
            <View style={styles.recurringHeader}>
              <View style={styles.recurringInfo}>
                <Text style={styles.label}>매년 반복</Text>
                <Text style={styles.recurringSubtext}>
                  {isRecurring ? '매년 이 날짜에 알림을 받습니다' : '이번 한 번만 알림을 받습니다'}
                </Text>
              </View>
              <Switch
                value={isRecurring}
                onValueChange={setIsRecurring}
                trackColor={{ false: '#E0E0E0', true: colors.primaryLight }}
                thumbColor={isRecurring ? colors.primary : '#B0B0B0'}
                disabled={isLoading}
              />
            </View>
          </View>

          {/* 메모 */}
          <View style={styles.section}>
            <Text style={styles.label}>메모</Text>
            <TextInput
              style={styles.descriptionInput}
              placeholder="이 기념일에 대한 특별한 기억이나 메모를 적어주세요 💭"
              placeholderTextColor="#B0B0B0"
              value={description}
              onChangeText={setDescription}
              multiline
              textAlignVertical="top"
              maxLength={200}
              editable={!isLoading}
            />
          </View>

          {/* D-Day 미리보기 */}
          <View style={styles.previewContainer}>
            <View style={styles.previewHeader}>
              <Text style={styles.previewTitle}>미리보기</Text>
              <Text style={styles.previewEmoji}>{selectedTypeInfo.emoji}</Text>
            </View>
            <View style={styles.previewCard}>
              <Text style={styles.previewCardTitle}>
                {title || '기념일 이름'}
              </Text>
              <Text style={styles.previewCardDate}>
                {formatDate(selectedDate)}
              </Text>
              <Text style={styles.previewCardRecurring}>
                {isRecurring ? '매년 반복' : '일회성'}
              </Text>
            </View>
          </View>

          {/* 저장 버튼 */}
          <TouchableOpacity
            style={[
              styles.saveButton,
              (isLoading || !title.trim()) && styles.saveButtonDisabled
            ]}
            onPress={handleSave}
            disabled={isLoading || !title.trim()}
          >
            <Icon name="celebration" size={24} color="#fff" />
            <Text style={styles.saveButtonText}>
              {isLoading ? '등록 중...' : '기념일 등록하기'}
            </Text>
          </TouchableOpacity>
        </View>
      </CustomScrollView>

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
