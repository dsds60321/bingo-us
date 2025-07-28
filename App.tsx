/**
 * 커플 앱 - 메인 App 컴포넌트
 * @format
 */

import React, { useEffect } from 'react';
import { StatusBar, LogBox } from 'react-native';
import { AppNavigator } from './src/navigation/AppNavigator';
import { useAppStore } from './src/store/appStore';
import { apiClient } from './src/services/ApiClient.ts';

// 개발 중 경고 무시 (선택사항)
LogBox.ignoreLogs([
    'Non-serializable values were found in the navigation state',
]);

function App(): React.JSX.Element {
  const { checkAuthStatus } = useAppStore();

  useEffect(() => {
    const initializeApp = async () => {
      console.log('🚀 앱 초기화 시작');

      // 1. ApiClient 세션키 복원
      await apiClient.restoreSessionKey();

      // 2. 인증 상태 확인
      await checkAuthStatus();

      console.log('✅ 앱 초기화 완료');
    };

    initializeApp();
  }, [checkAuthStatus]);

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

export default App;
