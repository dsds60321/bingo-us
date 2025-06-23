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
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../../store/themeStore';
import { useAppStore } from '../../store/appStore';
import { CustomScrollView } from '../../components/CustomScrollView.tsx';

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
  headerButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: colors.surfaceVariant,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.primary,
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  content: {
    padding: 20,
  },
  formContainer: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 24,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 8,
  },
  required: {
    color: '#FF6B6B',
  },
  input: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: '#333',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  inputFocused: {
    borderColor: colors.primary,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  dateTimeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  dateTimeButton: {
    flex: 1,
    backgroundColor: colors.surfaceVariant,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  dateTimeButtonFocused: {
    borderColor: colors.primary,
  },
  dateTimeText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  dateTimePlaceholder: {
    color: '#B0B0B0',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceVariant,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  locationIcon: {
    paddingLeft: 16,
  },
  locationInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    color: '#333',
  },
});

interface ScheduleAddScreenProps {
  navigation: any;
  route?: {
    params?: {
      selectedDate?: string;
    };
  };
}

export function ScheduleAddScreen({ navigation, route }: ScheduleAddScreenProps) {
  const colors = useTheme();
  const { user, couple, schedules, setSchedules } = useAppStore();

  const selectedDate = route?.params?.selectedDate || new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    title: '',
    date: selectedDate,
    time: '',
    location: '',
    description: '',
  });

  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleSave = () => {
    if (!formData.title.trim()) {
      Alert.alert('알림', '일정 제목을 입력해주세요.');
      return;
    }

    if (!formData.date) {
      Alert.alert('알림', '날짜를 선택해주세요.');
      return;
    }

    const newSchedule = {
      id: `schedule_${Date.now()}`,
      title: formData.title.trim(),
      date: formData.date,
      time: formData.time || undefined,
      location: formData.location.trim() || undefined,
      description: formData.description.trim() || undefined,
      coupleId: couple?.id || '',
      createdBy: user?.id || '',
    };

    setSchedules([...schedules, newSchedule]);

    Alert.alert(
      '일정 추가 완료! 📅',
      '새로운 일정이 추가되었습니다.',
      [
        {
          text: '확인',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFormData(prev => ({
        ...prev,
        date: selectedDate.toISOString().split('T')[0],
      }));
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const timeString = selectedTime.toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
      setFormData(prev => ({ ...prev, time: timeString }));
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    });
  };

  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="close" size={24} color={colors.primary} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>새 일정 추가</Text>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>저장</Text>
        </TouchableOpacity>
      </View>

      <CustomScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          {/* 일정 제목 */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              일정 제목 <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                focusedInput === 'title' && styles.inputFocused,
              ]}
              placeholder="무엇을 하실 예정인가요?"
              placeholderTextColor="#B0B0B0"
              value={formData.title}
              onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
              onFocus={() => setFocusedInput('title')}
              onBlur={() => setFocusedInput(null)}
            />
          </View>

          {/* 날짜 및 시간 */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              날짜 및 시간 <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.dateTimeContainer}>
              {/* 날짜 선택 */}
              <TouchableOpacity
                style={[
                  styles.dateTimeButton,
                  showDatePicker && styles.dateTimeButtonFocused,
                ]}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={[
                  styles.dateTimeText,
                  !formData.date && styles.dateTimePlaceholder,
                ]}>
                  {formData.date ? formatDate(formData.date) : '날짜 선택'}
                </Text>
                <Icon name="calendar-today" size={20} color={colors.primary} />
              </TouchableOpacity>

              {/* 시간 선택 */}
              <TouchableOpacity
                style={[
                  styles.dateTimeButton,
                  showTimePicker && styles.dateTimeButtonFocused,
                ]}
                onPress={() => setShowTimePicker(true)}
              >
                <Text style={[
                  styles.dateTimeText,
                  !formData.time && styles.dateTimePlaceholder,
                ]}>
                  {formData.time || '시간 선택'}
                </Text>
                <Icon name="access-time" size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* 장소 */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>장소</Text>
            <View style={[
              styles.locationContainer,
              focusedInput === 'location' && styles.inputFocused,
            ]}>
              <Icon
                name="location-on"
                size={20}
                color={focusedInput === 'location' ? colors.primary : '#666'}
                style={styles.locationIcon}
              />
              <TextInput
                style={styles.locationInput}
                placeholder="어디서 만나실 예정인가요?"
                placeholderTextColor="#B0B0B0"
                value={formData.location}
                onChangeText={(text) => setFormData(prev => ({ ...prev, location: text }))}
                onFocus={() => setFocusedInput('location')}
                onBlur={() => setFocusedInput(null)}
              />
            </View>
          </View>

          {/* 메모 */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>메모</Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                focusedInput === 'description' && styles.inputFocused,
              ]}
              placeholder="추가로 기록하고 싶은 내용이 있나요?"
              placeholderTextColor="#B0B0B0"
              value={formData.description}
              onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
              onFocus={() => setFocusedInput('description')}
              onBlur={() => setFocusedInput(null)}
              multiline
              numberOfLines={4}
            />
          </View>
        </View>
      </CustomScrollView>

      {/* 날짜 선택기 */}
      {showDatePicker && (
        <DateTimePicker
          value={formData.date ? new Date(formData.date) : new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          minimumDate={new Date()}
        />
      )}

      {/* 시간 선택기 */}
      {showTimePicker && (
        <DateTimePicker
          value={new Date()}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleTimeChange}
        />
      )}
    </SafeAreaView>
  );
}
