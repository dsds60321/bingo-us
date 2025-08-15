import React, { useEffect } from 'react';
import { StatusBar, LogBox } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import app from '@react-native-firebase/app'; // 올바른 import 방식
import { AppNavigator } from './src/navigation/AppNavigator';
import { useAppStore } from './src/store/appStore';
import { apiClient } from './src/services/ApiClient.ts';
import { PushNotificationUtils } from './src/utils/pushNotificationUtils.ts';

// 개발 중 경고 무시 (선택사항)
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
  'Setting a timer', // Firebase 관련 타이머 경고 무시
]);

// Firebase 백그라운드 메시지 핸들러 (앱 외부에서 등록)
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  console.log('📨 백그라운드 메시지 수신:', remoteMessage);

  // 백그라운드에서 받은 메시지 처리
  if (remoteMessage.notification) {
    console.log('📢 백그라운드 알림:', {
      title: remoteMessage.notification.title,
      body: remoteMessage.notification.body,
    });
  }

  if (remoteMessage.data) {
    console.log('📋 백그라운드 데이터:', remoteMessage.data);
  }
});

function App(): React.JSX.Element {
  const { checkAuthStatus, user, couple } = useAppStore();

  useEffect(() => {
    const initializeApp = async () => {
      console.log('🚀 앱 초기화 시작');

      try {
        // 1. Firebase 기본 상태 확인
        console.log('🔥 Firebase 상태 확인 중...');
        // await checkFirebaseStatus();

        // 2. ApiClient 세션키 복원
        console.log('🔑 API 클라이언트 세션키 복원 중...');
        await apiClient.restoreSessionKey();

        // 3. 인증 상태 확인
        console.log('👤 사용자 인증 상태 확인 중...');
        await checkAuthStatus();

        console.log('✅ 앱 기본 초기화 완료');

        // 4. Push 알림 시스템 초기화
        console.log('📱 Push 알림 시스템 초기화 중...');
        try {
          await PushNotificationUtils.initialize();
          console.log('✅ Push 알림 시스템 초기화 완료');
        } catch (pushError) {
          console.error('❌ Push 알림 초기화 실패:', pushError);
          // Push 알림 실패는 앱 전체에 영향주지 않도록 처리
        }

      } catch (error) {
        console.error('❌ 앱 초기화 중 오류:', error);
      }
    };

    initializeApp();
  }, [checkAuthStatus]);

  // 사용자 로그인 후 Push 알림 등록
  useEffect(() => {
    const registerPushNotifications = async () => {
      if (user?.id) {
        console.log('📱 사용자 Push 알림 등록:', user.id);
        try {
          await PushNotificationUtils.registerUserForPushNotifications(user.id);
        } catch (error) {
          console.error('❌ 사용자 Push 알림 등록 실패:', error);
        }
      }
    };

    registerPushNotifications();
  }, [user?.id]);

  // 커플 정보 있을 때 커플 토픽 구독
  useEffect(() => {
    const subscribeToCoupleNotifications = async () => {
      if (couple?.id) {
        console.log('💕 커플 알림 구독:', couple.id);
        try {
          await PushNotificationUtils.subscribeToCoupleNotifications(couple.id);
        } catch (error) {
          console.error('❌ 커플 알림 구독 실패:', error);
        }
      }
    };

    subscribeToCoupleNotifications();
  }, [couple?.id]);

  return (
    <>
      {/* 상태바 설정 */}
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#fff"
        translucent={false}
      />

      {/* 메인 내비게이션 */}
      <AppNavigator />
    </>
  );
}

/**
 * Firebase 기본 상태 확인 함수 - 수정됨
 */
async function checkFirebaseStatus(): Promise<void> {
  try {
    console.log('checkFirebaseSStatus')
    // Firebase App 초기화 상태 확인 (올바른 방식)
    const defaultApp = app(); // app()을 직접 호출

    console.log('------', defaultApp)
    console.log('🔥 Firebase 앱 정보:');
    console.log('📱 앱 이름:', defaultApp.name);
    console.log('📂 프로젝트 ID:', defaultApp.options.projectId);
    console.log('🆔 앱 ID:', defaultApp.options.appId?.substring(0, 20) + '...');
    console.log('📨 메시징 센더 ID:', defaultApp.options.messagingSenderId);

    // Platform 별 정보 출력
    if (defaultApp.options.bundleId) {
      console.log('📦 Bundle ID:', defaultApp.options.bundleId);
    }

    if (defaultApp.options.android?.packageName) {
      console.log('📱 Package Name:', defaultApp.options.android.packageName);
    }

    // Firebase Messaging 서비스 사용 가능 여부 확인
    const messagingAvailable = messaging.isSupported ? await messaging.isSupported() : true;
    console.log('📱 Firebase Messaging 지원:', messagingAvailable ? '✅' : '❌');

    if (!messagingAvailable) {
      console.warn('⚠️ Firebase Messaging이 이 환경에서 지원되지 않습니다');
    }

    console.log('✅ Firebase 상태 확인 완료');
  } catch (error) {
    console.error('❌ Firebase 상태 확인 실패:', error);

    // Firebase 설정 파일 확인 가이드
    console.log('💡 Firebase 설정 파일 확인사항:');
    console.log('   iOS: ios/bingoUs/GoogleService-Info.plist 파일이 있는지 확인');
    console.log('   Android: android/app/google-services.json 파일이 있는지 확인');
  }
}

export default App;
