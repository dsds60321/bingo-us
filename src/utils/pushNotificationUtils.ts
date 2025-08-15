import { firebaseMessagingService } from '../services/FirebaseMessagingService.ts';

/**
 * Push 알림 관련 유틸리티 함수들
 */
export class PushNotificationUtils {
  /**
   * Push 알림 초기화
   */
  static async initialize(): Promise<void> {
    await firebaseMessagingService.initialize();

    // 알림 탭 처리 콜백 설정
    firebaseMessagingService.onNotificationTap = (data) => {
      this.handleNotificationNavigation(data);
    };

    // 토큰 새로고침 콜백 설정
    firebaseMessagingService.onTokenRefresh = (token) => {
      this.updateTokenOnServer(token);
    };
  }

  /**
   * FCM 토큰 가져오기
   */
  static async getFCMToken(): Promise<string | null> {
    return await firebaseMessagingService.getFCMToken();
  }

  /**
   * 사용자별 토큰 서버 전송
   */
  static async registerUserForPushNotifications(userId: string): Promise<void> {
    try {
      console.log('📱 사용자 Push 알림 등록 시작:', userId);

      // FCM 토큰 등록 상태 확인 및 등록
      const success = await firebaseMessagingService.ensureTokenRegistered(userId);

      if (success) {
        console.log('✅ 사용자 Push 알림 등록 완료:', userId);
      } else {
        console.log('⚠️ 사용자 Push 알림 등록 실패:', userId);
      }
    } catch (error) {
      console.error('❌ 사용자 Push 알림 등록 중 오류:', error);
    }
  }

  /**
   * 커플 토픽 구독
   */
  static async subscribeToCoupleNotifications(coupleId: string): Promise<void> {
    try {
      await firebaseMessagingService.subscribeToTopic(`couple_${coupleId}`);
      console.log('✅ 커플 알림 구독 완료:', coupleId);
    } catch (error) {
      console.error('❌ 커플 알림 구독 실패:', error);
    }
  }

  /**
   * 커플 토픽 구독 해제
   */
  static async unsubscribeFromCoupleNotifications(coupleId: string): Promise<void> {
    try {
      await firebaseMessagingService.unsubscribeFromTopic(`couple_${coupleId}`);
      console.log('✅ 커플 알림 구독 해제 완료:', coupleId);
    } catch (error) {
      console.error('❌ 커플 알림 구독 해제 실패:', error);
    }
  }

  /**
   * 알림 데이터에 따른 네비게이션 처리
   */
  private static handleNotificationNavigation(data: { [key: string]: string }): void {
    try {
      const { type, screen, reflectionId, action } = data;

      console.log('📱 알림 네비게이션 처리:', data);

      switch (type) {
        case 'reflection_created':
        case 'reflection_updated':
        case 'reflection_approved':
        case 'reflection_rejected':
          console.log('📝 반성문 화면으로 이동:', { reflectionId, action });
          break;

        case 'message':
          console.log('💬 메시지 화면으로 이동:', data);
          break;

        case 'bingo':
          console.log('🎯 빙고 화면으로 이동:', screen);
          break;

        case 'date':
          console.log('💕 데이트 화면으로 이동:', screen);
          break;

        default:
          console.log('🏠 홈 화면으로 이동');
          break;
      }
    } catch (error) {
      console.error('❌ 알림 네비게이션 처리 실패:', error);
    }
  }

  /**
   * 서버에 토큰 업데이트 - store 의존성 제거
   */
  private static async updateTokenOnServer(token: string): Promise<void> {
    try {
      // store import를 지연 로딩으로 변경
      const { useAppStore } = await import('../store/appStore');
      const { user } = useAppStore.getState();

      if (user?.id) {
        console.log('🔄 토큰 새로고침으로 인한 서버 업데이트:', user.id);
        await firebaseMessagingService.sendTokenToServer(token, user.id);
        console.log('✅ 서버에 새 토큰 업데이트 완료');
      } else {
        console.log('⚠️ 사용자 정보가 없어 토큰 업데이트를 건너뜁니다');
      }
    } catch (error) {
      console.error('❌ 서버 토큰 업데이트 실패:', error);
    }
  }
}

/**
 * Push 알림 관련 커스텀 훅
 */
export const usePushNotifications = () => {
  const initializePushNotifications = async () => {
    await PushNotificationUtils.initialize();
  };

  const registerForNotifications = async (userId: string) => {
    await PushNotificationUtils.registerUserForPushNotifications(userId);
  };

  const subscribeToCoupleNotifications = async (coupleId: string) => {
    await PushNotificationUtils.subscribeToCoupleNotifications(coupleId);
  };

  const unsubscribeFromCoupleNotifications = async (coupleId: string) => {
    await PushNotificationUtils.unsubscribeFromCoupleNotifications(coupleId);
  };

  return {
    initializePushNotifications,
    registerForNotifications,
    subscribeToCoupleNotifications,
    unsubscribeFromCoupleNotifications,
  };
};
