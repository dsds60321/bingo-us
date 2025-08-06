import { AxiosResponse } from 'axios';
import { API_ENDPOINTS } from '../constants/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from './ApiClient';

// 서버 응답 형식에 맞춘 타입 정의
export interface LoginRequest {
  id: string;
  password: string;
}

export interface SignUpRequest {
  id: string;
  password: string;
  nickname: string;
  email: string;
}

export interface EmailVerifyRequest {
  email: string;
}

export interface EmailConfirmRequest {
  email: string;
  code: string;
}

// 🔥 새로운 로그인 응답 구조에 맞게 수정
export interface LoginResponse {
  success: boolean;
  message: string;
  code: string;
  data: {
    user: {
      id: string;
      username: string;
      nickname: string;
      email: string;
      emailVerified: boolean;
    };
    couple: {
      id: number;
      inviterId: string;
      inviteeId: string;
      coupleName: string;
      startDate: string | null;
      createdAt: string;
      updatedAt: string;
    } | null;
    message: string;
    sessionKey: string;
    nickname: string;
    success: boolean;
  };
  timestamp: number;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data?: {
    user: {
      id: string;
      username: string;
      nickname: string;
      email: string;
      emailVerified: boolean;
    };
    couple?: {
      id: number;
      inviterId: string;
      inviteeId: string;
      coupleName: string;
      startDate: string | null;
      createdAt: string;
      updatedAt: string;
    } | null;
    sessionKey: string;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

class AuthService {
  // 🔥 새로운 응답 구조에 맞게 로그인 함수 수정
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<LoginResponse> = await apiClient.post(
        API_ENDPOINTS.auth.signIn,
        credentials
      );

      console.log('Login response:', response.data);

      if (response.data.success) {
        const loginData = response.data.data;

        // sessionKey 저장 및 설정
        if (loginData.sessionKey) {
          await AsyncStorage.setItem('sessionKey', loginData.sessionKey);
          // 🔥 ApiClient에 세션키 설정 (개선된 방법)
          await apiClient.setSessionKey(loginData.sessionKey);
        }

        // 사용자 정보 저장
        await AsyncStorage.setItem('user', JSON.stringify(loginData.user));

        // couple 정보가 있으면 저장
        if (loginData.couple) {
          await AsyncStorage.setItem('couple', JSON.stringify(loginData.couple));
        } else {
          await AsyncStorage.removeItem('couple');
        }

        return {
          success: true,
          message: loginData.message,
          data: {
            user: loginData.user,
            couple: loginData.couple,
            sessionKey: loginData.sessionKey
          }
        };
      }

      return {
        success: false,
        message: response.data.message || '로그인에 실패했습니다.',
      };
    } catch (error: any) {
      console.error('Login error:', error);

      if (error.response?.data?.message) {
        return {
          success: false,
          message: error.response.data.message,
        };
      }

      return {
        success: false,
        message: '네트워크 오류가 발생했습니다.',
      };
    }
  }


  // 회원가입
  async signUp(userData: SignUpRequest): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<AuthResponse> = await apiClient.post(
        API_ENDPOINTS.auth.signup,
        userData
      );

      return response.data;
    } catch (error: any) {
      console.error('Sign up error:', error);

      if (error.response?.data?.message) {
        return {
          success: false,
          message: error.response.data.message,
        };
      }

      return {
        success: false,
        message: '회원가입 중 오류가 발생했습니다.',
      };
    }
  }

  // 이메일 인증 코드 발송
  async verifyEmail(id: string, email: string): Promise<ApiResponse> {
    try {
      const response: AxiosResponse<ApiResponse> = await apiClient.post(
        API_ENDPOINTS.auth.verifyEmail,
        { id, email }
      );

      return response.data;
    } catch (error: any) {
      console.error('Verify email error:', error);

      if (error.response?.data?.message) {
        return {
          success: false,
          message: error.response.data.message,
        };
      }

      return {
        success: false,
        message: '인증 코드 발송에 실패했습니다.',
      };
    }
  }

  // 이메일 인증 확인
  async confirmEmail(email: string, code: string): Promise<ApiResponse> {
    try {
      const response: AxiosResponse<ApiResponse> = await apiClient.post(
        API_ENDPOINTS.auth.confirmEmail,
        { email, code }
      );

      return response.data;
    } catch (error: any) {
      console.error('Confirm email error:', error);

      if (error.response?.data?.message) {
        return {
          success: false,
          message: error.response.data.message,
        };
      }

      return {
        success: false,
        message: '이메일 인증에 실패했습니다.',
      };
    }
  }

  // 로그아웃
  async logout(): Promise<void> {
    try {
      await apiClient.get(API_ENDPOINTS.auth.logout);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // 🔥 ApiClient에서 세션키 제거 (개선된 방법)
      await apiClient.removeSessionKey();
    }
  }


  // 토큰 리프레시
  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<AuthResponse> = await apiClient.post(
        API_ENDPOINTS.auth.refresh,
        { refreshToken }
      );

      if (response.data.success && response.data.data) {
        const authData = response.data.data;

        if (authData.accessToken) {
          await AsyncStorage.setItem('accessToken', authData.accessToken);
        }
        if (authData.refreshToken) {
          await AsyncStorage.setItem('refreshToken', authData.refreshToken);
        }

        return response.data;
      }

      return {
        success: false,
        message: response.data.message || '토큰 갱신에 실패했습니다.',
      };
    } catch (error: any) {
      console.error('Refresh token error:', error);
      return {
        success: false,
        message: '토큰 갱신에 실패했습니다.',
      };
    }
  }

  // 🔥 앱 시작 시 저장된 세션키 복원
  async restoreSession(): Promise<void> {
    try {
      // ApiClient의 새로운 메서드 사용
      await apiClient.restoreSessionKey();
    } catch (error) {
      console.error('❌ Session restore failed:', error);
    }
  }

  // 인증 상태 확인
  async isAuthenticated(): Promise<boolean> {
    try {
      const sessionKey = await AsyncStorage.getItem('sessionKey');
      return !!sessionKey;
    } catch (error) {
      return false;
    }
  }

  // 저장된 사용자 정보 조회
  async getStoredUser(): Promise<any> {
    try {
      const userData = await AsyncStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('저장된 사용자 정보 조회 오류:', error);
      return null;
    }
  }

  // 저장된 couple 정보 조회
  async getStoredCouple(): Promise<any> {
    try {
      const coupleData = await AsyncStorage.getItem('couple');
      return coupleData ? JSON.parse(coupleData) : null;
    } catch (error) {
      console.error('저장된 커플 정보 조회 오류:', error);
      return null;
    }
  }
}

export const authService = new AuthService();
