import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import notifee, { EventType } from '@notifee/react-native';
import { apiClient } from './ApiClient';
import { API_ENDPOINTS } from '../constants/config';

class FirebaseMessagingService {
  private static instance: FirebaseMessagingService;
  private fcmToken: string | null = null;

  // 콜백 함수들
  public onTokenRefresh?: (token: string) => void;
  public onNotificationTap?: (data: { [key: string]: string }) => void;

  private constructor() {}

  public static getInstance(): FirebaseMessagingService {
    if (!FirebaseMessagingService.instance) {
      FirebaseMessagingService.instance = new FirebaseMessagingService();
    }
    return FirebaseMessagingService.instance;
  }

  /**
   * 시뮬레이터 환경 감지
   */
  private isSimulator(): boolean {
    return false;
    // iOS 시뮬레이터 감지 (필요시 주석 해제)
    // return Platform.OS === 'ios' &&
    //   (Platform.isPad === undefined || !Platform.isPad) &&
    //   __DEV__;
  }

  /**
   * 디바이스 고유 ID 생성
   */
  private generateDeviceId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `${Platform.OS}_${timestamp}_${random}`;
  }

  /**
   * Firebase Messaging 초기화
   */
  public async initialize(): Promise<void> {
    try {
      console.log('🔔 Firebase Messaging 초기화 시작');

      // Notifee 초기화
      await this.initializeNotifee();

      // 환경 확인
      if (this.isSimulator()) {
        console.log('📱 시뮬레이터 환경 감지됨');
        console.log('⚠️ 시뮬레이터에서는 실제 Push 알림을 받을 수 없습니다');
        console.log('💡 실제 디바이스에서 테스트하시기 바랍니다');
      }

      // 권한 요청
      await this.requestPermission();

      // iOS에서는 APNS 토큰 대기 (시뮬레이터 제외)
      if (Platform.OS === 'ios' && !this.isSimulator()) {
        console.log('⏳ iOS APNS 토큰 대기 중...');
        await this.waitForAPNSToken();
      } else if (this.isSimulator()) {
        console.log('🔄 시뮬레이터에서는 APNS 토큰 대기 건너뜀');
      }

      // FCM 토큰 가져오기
      await this.getFCMToken();

      // 메시지 리스너 설정
      this.setupMessageListeners();

      console.log('✅ Firebase Messaging 초기화 완료');
    } catch (error) {
      console.error('❌ Firebase Messaging 초기화 실패:', error);
    }
  }

  /**
   * Notifee 초기화
   */
  private async initializeNotifee(): Promise<void> {
    try {
      // Android 알림 채널 생성
      if (Platform.OS === 'android') {
        await notifee.createChannel({
          id: 'default',
          name: '기본 알림',
          importance: 4, // HIGH importance
          sound: 'default',
          vibration: true,
          vibrationPattern: [300, 500],
        });

        // 추가 채널들 (필요시)
        await notifee.createChannel({
          id: 'important',
          name: '중요한 알림',
          importance: 4,
          sound: 'default',
          vibration: true,
          vibrationPattern: [300, 500, 300, 500],
        });

        console.log('✅ Android 알림 채널 생성 완료');
      }

      // iOS 권한 요청
      if (Platform.OS === 'ios') {
        await notifee.requestPermission();
        console.log('✅ iOS Notifee 권한 요청 완료');
      }

      // 알림 이벤트 리스너 설정
      this.setupNotifeeEventListeners();

    } catch (error) {
      console.error('❌ Notifee 초기화 실패:', error);
    }
  }

  /**
   * Notifee 이벤트 리스너 설정
   */
  private setupNotifeeEventListeners(): void {
    // 포그라운드 이벤트 (앱이 열려있을 때)
    notifee.onForegroundEvent(({ type, detail }) => {
      console.log('📱 Notifee 포그라운드 이벤트:', { type, detail });

      switch (type) {
        case EventType.DISMISSED:
          console.log('📱 알림이 dismissed됨:', detail.notification);
          break;
        case EventType.PRESS:
          console.log('📱 알림이 탭됨:', detail.notification);
          if (detail.notification?.data) {
            this.handleNotificationTap({
              data: detail.notification.data
            } as FirebaseMessagingTypes.RemoteMessage);
          }
          break;
      }
    });

    // 백그라운드 이벤트 (앱이 백그라운드에 있을 때)
    notifee.onBackgroundEvent(async ({ type, detail }) => {
      console.log('📱 Notifee 백그라운드 이벤트:', { type, detail });

      if (type === EventType.PRESS && detail.notification?.data) {
        // 백그라운드에서 알림 탭 시 처리
        this.handleNotificationTap({
          data: detail.notification.data
        } as FirebaseMessagingTypes.RemoteMessage);
      }
    });
  }

  /**
   * 알림 권한 요청
   */
  private async requestPermission(): Promise<void> {
    try {
      if (Platform.OS === 'android') {
        // Android: Notifee로 권한 요청
        const settings = await notifee.requestPermission();
        console.log('✅ Android 알림 권한:', settings);
      } else {
        // iOS: Firebase Messaging으로 권한 요청
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (enabled) {
          console.log('✅ iOS 알림 권한 허용됨:', authStatus);
        } else {
          console.log('❌ iOS 알림 권한 거부됨:', authStatus);
        }
      }
    } catch (error) {
      console.error('❌ 알림 권한 요청 실패:', error);
    }
  }

  /**
   * iOS APNS 토큰 대기 (실제 디바이스만)
   */
  private async waitForAPNSToken(): Promise<void> {
    return new Promise((resolve) => {
      let attempts = 0;
      const maxAttempts = 15; // 15초 대기

      const checkAPNSToken = async () => {
        attempts++;
        try {
          const messagingInstance = messaging();
          const apnsToken = await messagingInstance.getAPNSToken();

          if (apnsToken) {
            console.log('✅ APNS 토큰 확인됨! FCM 토큰 요청 가능');
            resolve();
            return;
          }
        } catch (error) {
          console.log(`⏳ APNS 토큰 체크 중... (시도 ${attempts})`);
        }

        if (attempts >= maxAttempts) {
          console.log('⚠️ APNS 토큰 대기 시간 초과. FCM 토큰 요청을 계속 시도합니다.');
          resolve();
        } else {
          console.log(`⏳ APNS 토큰 대기 중... (${attempts}/${maxAttempts}초)`);
          setTimeout(checkAPNSToken, 1000);
        }
      };

      checkAPNSToken();
    });
  }

  /**
   * FCM 토큰 가져오기
   */
  public async getFCMToken(): Promise<string | null> {
    try {
      if (this.fcmToken) {
        console.log('📱 캐시된 FCM 토큰 반환');
        return this.fcmToken;
      }

      console.log('🔄 새로운 FCM 토큰 요청 중...');

      // 시뮬레이터 처리
      if (this.isSimulator()) {
        console.log('📱 시뮬레이터 환경: APNS 토큰 없이 FCM 토큰 요청');
        console.log('⚠️ 실제 Push 알림은 작동하지 않지만 토큰 생성은 시도됩니다');
      } else {
        // 실제 디바이스에서 APNS 토큰 상태 확인
        try {
          const messagingInstance = messaging();
          const apnsToken = await messagingInstance.getAPNSToken();

          if (!apnsToken) {
            console.log('❌ APNS 토큰이 아직 설정되지 않았습니다');
          } else {
            console.log('✅ APNS 토큰 존재 - FCM 토큰 요청 진행');
          }
        } catch (error) {
          console.log('⚠️ APNS 토큰 확인 중 오류:', error);
        }
      }

      // FCM 토큰 가져오기 시도
      try {
        const messagingInstance = messaging();
        const token = await messagingInstance.getToken();

        if (token) {
          console.log('🎉 FCM 토큰 획득 성공!');
          console.log('📱 FCM 토큰:', token.substring(0, 50) + '...');

          this.fcmToken = token;
          await AsyncStorage.setItem('fcm_token', token);

          return token;
        } else {
          console.log('❌ FCM 토큰이 null입니다');
          return null;
        }
      } catch (tokenError: any) {
        // 시뮬레이터에서 예상되는 에러 처리
        if (this.isSimulator() && tokenError.message?.includes('APNS')) {
          console.log('📱 시뮬레이터에서 APNS 토큰 부족으로 FCM 토큰 생성 불가');
          console.log('💡 이는 정상적인 시뮬레이터 제한사항입니다');
          console.log('🔥 실제 디바이스에서는 정상 작동합니다');

          // 시뮬레이터용 더미 토큰 생성 (개발용)
          const dummyToken = `simulator-token-${Date.now()}`;
          console.log('🔄 시뮬레이터용 더미 토큰 생성:', dummyToken);

          this.fcmToken = dummyToken;
          await AsyncStorage.setItem('fcm_token', dummyToken);

          return dummyToken;
        } else {
          throw tokenError;
        }
      }
    } catch (error: any) {
      console.error('❌ FCM 토큰 가져오기 최종 실패:', error);

      // 재시도 로직 (실제 디바이스만)
      if (Platform.OS === 'ios' && !this.isSimulator() && error.message?.includes('APNS')) {
        console.log('🔄 3초 후 FCM 토큰 재시도...');
        setTimeout(() => {
          this.getFCMToken();
        }, 3000);
      }

      return null;
    }
  }

  /**
   * 저장된 FCM 토큰 가져오기
   */
  public async getStoredFCMToken(): Promise<string | null> {
    try {
      const storedToken = await AsyncStorage.getItem('fcm_token');
      if (storedToken) {
        console.log('📱 저장된 FCM 토큰 발견');
        this.fcmToken = storedToken;
        return storedToken;
      }
      return await this.getFCMToken();
    } catch (error) {
      console.error('❌ 저장된 FCM 토큰 가져오기 실패:', error);
      return null;
    }
  }

  /**
   * 메시지 리스너 설정
   */
  private setupMessageListeners(): void {
    try {
      const messagingInstance = messaging();

      // 포그라운드 메시지 처리
      messagingInstance.onMessage(async (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
        console.log('📨 포그라운드 메시지 수신:', remoteMessage);
        await this.handleForegroundMessage(remoteMessage);
      });

      // 백그라운드 메시지 처리
      messagingInstance.onNotificationOpenedApp((remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
        console.log('📨 백그라운드에서 알림 탭:', remoteMessage);
        this.handleNotificationTap(remoteMessage);
      });

      // 앱이 종료된 상태에서 알림 탭으로 앱 실행
      messagingInstance
        .getInitialNotification()
        .then((remoteMessage: FirebaseMessagingTypes.RemoteMessage | null) => {
          if (remoteMessage) {
            console.log('📨 앱 종료 상태에서 알림으로 실행:', remoteMessage);
            this.handleNotificationTap(remoteMessage);
          }
        });

      // FCM 토큰 새로고침
      messagingInstance.onTokenRefresh((token: string) => {
        console.log('🔄 FCM 토큰 새로고침:', token.substring(0, 50) + '...');
        this.fcmToken = token;
        AsyncStorage.setItem('fcm_token', token);
        this.onTokenRefresh?.(token);
      });

      console.log('✅ 메시지 리스너 설정 완료');
    } catch (error) {
      console.error('❌ 메시지 리스너 설정 실패:', error);
    }
  }

  /**
   * 포그라운드 메시지 처리 (Notifee 사용)
   */
  private async handleForegroundMessage(remoteMessage: FirebaseMessagingTypes.RemoteMessage): Promise<void> {
    const { notification, data } = remoteMessage;

    if (notification) {
      console.log('📨 포그라운드에서 Notifee 알림 표시:', notification.title);

      try {
        // Notifee로 로컬 알림 표시
        await notifee.displayNotification({
          title: notification.title || '알림',
          body: notification.body || '',
          data: data || {},
          android: {
            channelId: 'default',
            importance: 4,
            pressAction: {
              id: 'default',
            },
            sound: 'default',
            vibrationPattern: [300, 500],
            // 알림 아이콘 설정 (선택사항)
            // smallIcon: 'ic_notification',
            // largeIcon: 'ic_launcher',
            // 알림 색상 (선택사항)
            // color: '#FF0000',
            // 액션 버튼 추가 (선택사항)
            // actions: [
            //   {
            //     title: '확인',
            //     pressAction: { id: 'confirm' },
            //   },
            //   {
            //     title: '취소',
            //     pressAction: { id: 'cancel' },
            //   },
            // ],
          },
          ios: {
            sound: 'default',
            // iOS 배지 카운트 (선택사항)
            // badgeCount: 1,
            // iOS 카테고리 (선택사항)
            // categoryId: 'default',
          },
        });

        console.log('✅ Notifee 알림 표시 성공');
      } catch (error) {
        console.error('❌ Notifee 알림 표시 실패:', error);

        // Notifee 실패 시 fallback으로 Alert 사용 (개발용)
        // Alert.alert(
        //   notification.title || '알림',
        //   notification.body || '',
        //   [{ text: '확인', onPress: () => this.handleNotificationTap(remoteMessage) }]
        // );
      }
    }
  }

  /**
   * 알림 탭 처리
   */
  private handleNotificationTap(remoteMessage: FirebaseMessagingTypes.RemoteMessage): void {
    const { data } = remoteMessage;
    if (data) {
      console.log('📱 알림 탭 - 데이터:', data);
      this.onNotificationTap?.(data);
    }
  }

  /**
   * 서버에 FCM 토큰 전송
   */
  public async sendTokenToServer(token: string, userId?: string): Promise<void> {
    try {
      if (!userId) {
        console.log('⚠️ 사용자 ID가 없어 FCM 토큰 등록을 건너뜁니다');
        return;
      }

      console.log('📤 서버에 FCM 토큰 등록 시작:', {
        token: token.substring(0, 30) + '...',
        userId,
        platform: Platform.OS,
        isSimulator: this.isSimulator()
      });

      // 디바이스 ID 생성 또는 저장된 것 사용
      let deviceId = await AsyncStorage.getItem('device_id');
      if (!deviceId) {
        deviceId = this.generateDeviceId();
        await AsyncStorage.setItem('device_id', deviceId);
        console.log('📱 새 디바이스 ID 생성:', deviceId);
      }

      // 서버에 FCM 토큰 등록 요청
      const requestData = {
        userId: userId,
        fcmToken: token,
        deviceId: deviceId,
        platform: Platform.OS === 'ios' ? 'iOS' : 'Android'
      };

      console.log('📡 FCM 토큰 등록 요청 데이터:', {
        ...requestData,
        fcmToken: requestData.fcmToken.substring(0, 30) + '...'
      });

      const response = await apiClient.post(
        API_ENDPOINTS.notification?.registerToken || '/api/notifications/fcm-token',
        requestData
      );

      if (response.data.success) {
        console.log('✅ FCM 토큰 서버 등록 성공');

        // 등록 성공 시 로컬에 저장
        await AsyncStorage.setItem('fcm_token_registered', 'true');
        await AsyncStorage.setItem('fcm_token_user_id', userId);
      } else {
        console.error('❌ FCM 토큰 서버 등록 실패:', response.data.message);
      }

    } catch (error: any) {
      console.error('❌ FCM 토큰 서버 전송 실패:', error);

      // 네트워크 오류 등으로 실패한 경우 나중에 재시도할 수 있도록 표시
      await AsyncStorage.removeItem('fcm_token_registered');

      // 에러 상세 로그
      if (error.response) {
        console.error('서버 응답 오류:', {
          status: error.response.status,
          data: error.response.data
        });
      }
    }
  }

  /**
   * FCM 토큰 등록 상태 확인 및 재등록
   */
  public async ensureTokenRegistered(userId: string): Promise<boolean> {
    try {
      const isRegistered = await AsyncStorage.getItem('fcm_token_registered');
      const registeredUserId = await AsyncStorage.getItem('fcm_token_user_id');
      const currentToken = await this.getFCMToken();

      // 토큰이 등록되지 않았거나, 다른 사용자로 등록되었거나, 토큰이 없는 경우
      if (!isRegistered || registeredUserId !== userId || !currentToken) {
        console.log('📱 FCM 토큰 재등록 필요:', {
          isRegistered: !!isRegistered,
          userChanged: registeredUserId !== userId,
          hasToken: !!currentToken
        });

        if (currentToken) {
          await this.sendTokenToServer(currentToken, userId);
          return true;
        } else {
          console.log('⚠️ FCM 토큰이 없어 등록할 수 없습니다');
          return false;
        }
      }

      console.log('✅ FCM 토큰이 이미 등록되어 있습니다');
      return true;
    } catch (error) {
      console.error('❌ FCM 토큰 등록 상태 확인 실패:', error);
      return false;
    }
  }

  /**
   * 토픽 구독
   */
  public async subscribeToTopic(topic: string): Promise<void> {
    try {
      if (this.isSimulator()) {
        console.log(`📱 시뮬레이터: 토픽 구독 시뮬레이션 - ${topic}`);
        return;
      }

      const messagingInstance = messaging();
      await messagingInstance.subscribeToTopic(topic);
      console.log(`✅ 토픽 구독 성공: ${topic}`);
    } catch (error) {
      console.error(`❌ 토픽 구독 실패: ${topic}`, error);
    }
  }

  /**
   * 토픽 구독 해제
   */
  public async unsubscribeFromTopic(topic: string): Promise<void> {
    try {
      if (this.isSimulator()) {
        console.log(`📱 시뮬레이터: 토픽 구독 해제 시뮬레이션 - ${topic}`);
        return;
      }

      const messagingInstance = messaging();
      await messagingInstance.unsubscribeFromTopic(topic);
      console.log(`✅ 토픽 구독 해제 성공: ${topic}`);
    } catch (error) {
      console.error(`❌ 토픽 구독 해제 실패: ${topic}`, error);
    }
  }

  /**
   * 알림 배지 카운트 설정 (iOS)
   */
  public async setBadgeCount(count: number): Promise<void> {
    try {
      if (Platform.OS === 'ios') {
        await notifee.setBadgeCount(count);
        console.log(`✅ 배지 카운트 설정: ${count}`);
      }
    } catch (error) {
      console.error('❌ 배지 카운트 설정 실패:', error);
    }
  }

  /**
   * 알림 배지 카운트 증가 (iOS)
   */
  public async incrementBadgeCount(): Promise<void> {
    try {
      if (Platform.OS === 'ios') {
        await notifee.incrementBadgeCount();
        console.log('✅ 배지 카운트 증가');
      }
    } catch (error) {
      console.error('❌ 배지 카운트 증가 실패:', error);
    }
  }

  /**
   * 표시된 알림 취소
   */
  public async cancelNotification(notificationId: string): Promise<void> {
    try {
      await notifee.cancelNotification(notificationId);
      console.log(`✅ 알림 취소: ${notificationId}`);
    } catch (error) {
      console.error('❌ 알림 취소 실패:', error);
    }
  }

  /**
   * 모든 알림 취소
   */
  public async cancelAllNotifications(): Promise<void> {
    try {
      await notifee.cancelAllNotifications();
      console.log('✅ 모든 알림 취소');
    } catch (error) {
      console.error('❌ 모든 알림 취소 실패:', error);
    }
  }
}

export const firebaseMessagingService = FirebaseMessagingService.getInstance();
