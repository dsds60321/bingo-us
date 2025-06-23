import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Switch,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAppStore } from '../../store/appStore';
import { NotificationService } from '../../services/notificationService';
import { CustomScrollView } from '../../components/CustomScrollView.tsx';

interface MessageSetting {
  id: string;
  message: string;
  time: string;
  isEnabled: boolean;
  isForPartner: boolean;
}

export function MessagesScreen() {
  const { user, couple } = useAppStore();
  const [messages, setMessages] = useState<MessageSetting[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedTime, setSelectedTime] = useState('09:00');
  const [isForPartner, setIsForPartner] = useState(false);

  const notificationService = NotificationService.getInstance();

  // 컴포넌트 마운트 시 저장된 메시지 불러오기
  useEffect(() => {
    // 로컬 스토리지에서 메시지 불러오기 (나중에 구현)
    loadSavedMessages();
  }, []);

  // 저장된 메시지 불러오기 (더미 데이터)
  const loadSavedMessages = () => {
    const dummyMessages: MessageSetting[] = [
      {
        id: '1',
        message: '오늘도 사랑해요! 💕',
        time: '08:00',
        isEnabled: true,
        isForPartner: true,
      },
      {
        id: '2',
        message: '좋은 하루 되세요~',
        time: '18:00',
        isEnabled: false,
        isForPartner: false,
      },
    ];
    setMessages(dummyMessages);
  };

  // 메시지 추가
  const addMessage = () => {
    if (!newMessage.trim()) {
      Alert.alert('알림', '메시지를 입력해주세요.');
      return;
    }

    const messageId = Date.now().toString();
    const newMessageSetting: MessageSetting = {
      id: messageId,
      message: newMessage.trim(),
      time: selectedTime,
      isEnabled: true,
      isForPartner,
    };

    setMessages(prev => [...prev, newMessageSetting]);

    // 알림 스케줄링
    notificationService.scheduleDailyMessage(
      messageId,
      newMessage.trim(),
      selectedTime,
      (message) => {
        console.log('메시지 전송됨:', message);
      }
    );

    setNewMessage('');
    Alert.alert('성공', '메시지가 설정되었습니다.');
  };

  // 메시지 토글
  const toggleMessage = (messageId: string) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const updated = { ...msg, isEnabled: !msg.isEnabled };

        if (updated.isEnabled) {
          // 알림 활성화
          notificationService.scheduleDailyMessage(
            messageId,
            updated.message,
            updated.time
          );
        } else {
          // 알림 비활성화
          notificationService.cancelNotification(messageId);
        }

        return updated;
      }
      return msg;
    }));
  };

  // 메시지 삭제
  const deleteMessage = (messageId: string) => {
    Alert.alert(
      '삭제 확인',
      '이 메시지를 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => {
            notificationService.cancelNotification(messageId);
            setMessages(prev => prev.filter(msg => msg.id !== messageId));
          }
        }
      ]
    );
  };

  // 시간 선택 옵션
  const timeOptions = [
    '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00',
    '19:00', '20:00', '21:00', '22:00'
  ];

  const partnerName = couple?.users.find(u => u.id !== user?.id)?.name || '파트너';

  return (
    <SafeAreaView style={styles.container}>
      <CustomScrollView showsVerticalScrollIndicator={false}>
        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={styles.title}>💕 사랑의 메시지</Text>
          <Text style={styles.subtitle}>
            매일 정해진 시간에 서로에게 메시지를 보내세요
          </Text>
        </View>

        {/* 메시지 추가 폼 */}
        <View style={styles.addForm}>
          <Text style={styles.sectionTitle}>새 메시지 추가</Text>

          <TextInput
            style={styles.messageInput}
            placeholder="사랑의 메시지를 입력하세요..."
            placeholderTextColor="#999"
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
            textAlignVertical="top"
            maxLength={200}
          />

          <View style={styles.settingsRow}>
            <Text style={styles.label}>알림 시간</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.timeScrollView}
            >
              {timeOptions.map(time => (
                <TouchableOpacity
                  key={time}
                  style={[
                    styles.timeOption,
                    selectedTime === time && styles.selectedTime
                  ]}
                  onPress={() => setSelectedTime(time)}
                >
                  <Text style={[
                    styles.timeText,
                    selectedTime === time && styles.selectedTimeText
                  ]}>
                    {time}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.settingsRow}>
            <Text style={styles.label}>받는 사람</Text>
            <View style={styles.recipientToggle}>
              <Text style={styles.recipientText}>
                {isForPartner ? partnerName : '나'}
              </Text>
              <Switch
                value={isForPartner}
                onValueChange={setIsForPartner}
                trackColor={{ false: '#767577', true: '#81b0ff' }}
                thumbColor={isForPartner ? '#007AFF' : '#f4f3f4'}
              />
            </View>
          </View>

          <TouchableOpacity style={styles.addButton} onPress={addMessage}>
            <Icon name="add" size={20} color="#fff" />
            <Text style={styles.addButtonText}>메시지 추가</Text>
          </TouchableOpacity>
        </View>

        {/* 설정된 메시지 목록 */}
        <View style={styles.messagesList}>
          <Text style={styles.sectionTitle}>설정된 메시지</Text>

          {messages.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="message" size={48} color="#ccc" />
              <Text style={styles.emptyText}>설정된 메시지가 없습니다</Text>
              <Text style={styles.emptySubText}>위에서 첫 번째 메시지를 추가해보세요!</Text>
            </View>
          ) : (
            messages.map(message => (
              <View key={message.id} style={styles.messageCard}>
                <View style={styles.messageHeader}>
                  <View style={styles.messageInfo}>
                    <Text style={styles.messageText} numberOfLines={2}>
                      {message.message}
                    </Text>
                    <Text style={styles.messageDetails}>
                      {message.time} • {message.isForPartner ? partnerName : '나'}에게
                    </Text>
                  </View>
                  <View style={styles.messageActions}>
                    <Switch
                      value={message.isEnabled}
                      onValueChange={() => toggleMessage(message.id)}
                      trackColor={{ false: '#767577', true: '#81b0ff' }}
                      thumbColor={message.isEnabled ? '#007AFF' : '#f4f3f4'}
                    />
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => deleteMessage(message.id)}
                    >
                      <Icon name="delete" size={20} color="#ff3b30" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* 활성화 상태 표시 */}
                <View style={[
                  styles.statusIndicator,
                  { backgroundColor: message.isEnabled ? '#4CAF50' : '#9E9E9E' }
                ]}>
                  <Text style={styles.statusText}>
                    {message.isEnabled ? '활성화됨' : '비활성화됨'}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* 하단 안내 */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            💡 설정된 시간에 알림이 표시됩니다
          </Text>
          <Text style={styles.footerSubText}>
            알림 권한이 필요할 수 있습니다
          </Text>
        </View>
      </CustomScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    paddingTop: 20,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
    textAlign: 'center',
  },
  addForm: {
    margin: 20,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  messageInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    height: 100,
    marginBottom: 20,
    backgroundColor: '#fafafa',
  },
  settingsRow: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  timeScrollView: {
    maxHeight: 50,
  },
  timeOption: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedTime: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  timeText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  selectedTimeText: {
    color: '#fff',
  },
  recipientToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
  },
  recipientText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 12,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  messagesList: {
    margin: 20,
    marginTop: 0,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#fff',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
    fontWeight: '500',
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
    textAlign: 'center',
  },
  messageCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  messageInfo: {
    flex: 1,
    marginRight: 15,
  },
  messageText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
    fontWeight: '500',
    lineHeight: 22,
  },
  messageDetails: {
    fontSize: 14,
    color: '#666',
  },
  messageActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteButton: {
    marginLeft: 15,
    padding: 5,
  },
  statusIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 5,
  },
  footerSubText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
});
