import React, { useState } from 'react';
import {
  Alert,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { format, isToday, isTomorrow, isYesterday } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useTheme } from '../../store/themeStore';
import { useBudgetStore } from '../../store/budgetStore';
import { useAppStore } from '../../store/appStore';
import { BudgetItem } from '../../types';
import { CustomScrollView } from '../../components/CustomScrollView.tsx';
import { budgetService } from '../../services/BudgetService.ts';

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
  input: {
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
  amountInput: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
    borderWidth: 2,
    borderColor: colors.surfaceVariant,
    textAlign: 'center',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceVariant,
    borderRadius: 16,
    padding: 12,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedCategory: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryIcon: {
    marginRight: 8,
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  selectedCategoryText: {
    color: '#fff',
    fontWeight: '700',
  },
  userGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  userOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceVariant,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedUser: {
    backgroundColor: colors.accent1,
    borderColor: colors.accent1,
  },
  userText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
    marginLeft: 8,
  },
  selectedUserText: {
    color: '#fff',
    fontWeight: '700',
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

type CategoryType = 'food' | 'entertainment' | 'transport' | 'shopping' | 'travel' | 'health' | 'other';
type SplitType = 'equal' | 'custom';

export function BudgetAddScreen({ navigation }: any) {
  const colors = useTheme();
  const { addBudgetItem } = useBudgetStore();
  const { couple } = useAppStore();

  // users는 couple.users에서 가져옴
  const users = couple?.users || [];

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<CategoryType>('food');
  const [paidBy, setPaidBy] = useState(users[0]?.id || '');
  const [date, setDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date()); // 캘린더에서 선택된 임시 날짜
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [splitType] = useState<SplitType>('equal');

  const categories = [
    { key: 'food', label: '식비', icon: 'restaurant' },
    { key: 'entertainment', label: '오락', icon: 'movie' },
    { key: 'transport', label: '교통', icon: 'directions-car' },
    { key: 'shopping', label: '쇼핑', icon: 'shopping-bag' },
    { key: 'travel', label: '여행', icon: 'flight' },
    { key: 'health', label: '건강', icon: 'local-hospital' },
    { key: 'other', label: '기타', icon: 'more-horiz' },
  ] as const;

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('알림', '지출 내용을 입력해주세요.');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('알림', '올바른 금액을 입력해주세요.');
      return;
    }

    if (users.length === 0) {
      Alert.alert('알림', '사용자 정보가 없습니다.');
      return;
    }

    const newBudgetItem: Omit<BudgetItem, 'id'> = {
      title: title.trim(),
      amount: parseFloat(amount),
      paidBy,
      category,
      date: format(date, 'yyyy-MM-dd'),
      location: location.trim() || undefined,
      description: description.trim() || undefined,
      coupleId: couple?.id || 'couple1',
    };

    try {
      const response = await budgetService.addBudgetItem(newBudgetItem);

      if (response.success) {
        Alert.alert(
          '완료!',
          '새로운 지출이 등록되었습니다.',
          [
            {
              text: '확인',
              onPress: () => {
                navigation.navigate('Main', {
                  screen: 'Budget',   // Main 탭 내 Budget 화면
                  params: { refresh: true }, // 데이터 갱신 플래그 전달
                });

              },
            },
          ]
        );
      } else {
        Alert.alert('등록 실패', response.message || '지출 등록에 실패했습니다.');
      }

    } catch (error) {
      Alert.alert('에러', '지출 등록 중 오류가 발생했습니다.');
      console.error('handleSave error:', error);
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

  const formatAmount = (value: string) => {
    const numValue = value.replace(/[^0-9]/g, '');
    return new Intl.NumberFormat('ko-KR').format(parseInt(numValue) || 0);
  };

  const handleDateSelect = (day: any) => {
    setSelectedDate(new Date(day.dateString));
  };

  const confirmDateSelection = () => {
    setDate(selectedDate);
    setShowDatePicker(false);
  };

  const cancelDateSelection = () => {
    setSelectedDate(date);
    setShowDatePicker(false);
  };

  const openDatePicker = () => {
    setSelectedDate(date);
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
      <CustomScrollView showsVerticalScrollIndicator={false}>
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>💰 지출 등록</Text>
          <View style={styles.placeholder} />
        </View>

        {/* 폼 */}
        <View style={styles.form}>
          {/* 지출 내용 */}
          <View style={styles.section}>
            <Text style={styles.label}>지출 내용 *</Text>
            <TextInput
              style={styles.input}
              placeholder="무엇을 구매하셨나요? 💳"
              placeholderTextColor="#B0B0B0"
              value={title}
              onChangeText={setTitle}
              maxLength={50}
            />
          </View>

          {/* 금액 */}
          <View style={styles.section}>
            <Text style={styles.label}>금액 *</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="0"
              placeholderTextColor="#B0B0B0"
              value={formatAmount(amount)}
              onChangeText={(text) => setAmount(text.replace(/[^0-9]/g, ''))}
              keyboardType="numeric"
              maxLength={12}
            />
          </View>

          {/* 카테고리 */}
          <View style={styles.section}>
            <Text style={styles.label}>카테고리</Text>
            <View style={styles.categoryGrid}>
              {categories.map(cat => (
                <TouchableOpacity
                  key={cat.key}
                  style={[
                    styles.categoryOption,
                    category === cat.key && styles.selectedCategory
                  ]}
                  onPress={() => setCategory(cat.key)}
                >
                  <Icon
                    name={cat.icon}
                    size={20}
                    color={category === cat.key ? '#fff' : '#666'}
                    style={styles.categoryIcon}
                  />
                  <Text style={[
                    styles.categoryText,
                    category === cat.key && styles.selectedCategoryText
                  ]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 결제자 */}
          {users.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.label}>누가 결제했나요?</Text>
              <View style={styles.userGrid}>
                {users.map(user => (
                  <TouchableOpacity
                    key={user.id}
                    style={[
                      styles.userOption,
                      paidBy === user.id && styles.selectedUser
                    ]}
                    onPress={() => setPaidBy(user.id)}
                  >
                    <Icon
                      name="person"
                      size={20}
                      color={paidBy === user.id ? '#fff' : '#666'}
                    />
                    <Text style={[
                      styles.userText,
                      paidBy === user.id && styles.selectedUserText
                    ]}>
                      {user.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* 날짜 */}
          <View style={styles.section}>
            <Text style={styles.label}>날짜</Text>
            <TouchableOpacity style={styles.dateButton} onPress={openDatePicker}>
              <Icon name="calendar-today" size={20} color={colors.primary} />
              <Text style={styles.dateText}>{formatDate(date)}</Text>
              <Icon name="chevron-right" size={20} color="#B0B0B0" />
            </TouchableOpacity>
          </View>

          {/* 장소 */}
          <View style={styles.section}>
            <Text style={styles.label}>장소</Text>
            <TextInput
              style={styles.input}
              placeholder="어디서 사용하셨나요? 📍"
              placeholderTextColor="#B0B0B0"
              value={location}
              onChangeText={setLocation}
              maxLength={50}
            />
          </View>

          {/* 메모 */}
          <View style={styles.section}>
            <Text style={styles.label}>메모</Text>
            <TextInput
              style={[styles.input, { height: 80 }]}
              placeholder="추가로 기록하고 싶은 내용이 있나요? 📝"
              placeholderTextColor="#B0B0B0"
              value={description}
              onChangeText={setDescription}
              multiline
              textAlignVertical="top"
              maxLength={200}
            />
          </View>

          {/* 저장 버튼 */}
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Icon name="save" size={24} color="#fff" />
            <Text style={styles.saveButtonText}>지출 저장하기</Text>
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
              current={format(selectedDate, 'yyyy-MM-dd')}
              onDayPress={handleDateSelect}
              maxDate={format(new Date(), 'yyyy-MM-dd')} // 오늘까지만 선택 가능
              monthFormat={'yyyy년 M월'}
              theme={getCalendarTheme()}
              markedDates={{
                [format(selectedDate, 'yyyy-MM-dd')]: {
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
