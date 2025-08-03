import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { API_CONFIG } from '../constants/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

class ApiClient {
  private static instance: ApiClient;
  public api: AxiosInstance;
  private currentSessionKey: string | null = null;

  private constructor() {
    this.api = axios.create({
      baseURL: API_CONFIG.API_BASE_URL,
      timeout: API_CONFIG.API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  private setupInterceptors() {
    // 🔥 요청 인터셉터 - 강화된 디버깅
    this.api.interceptors.request.use(
      async (config) => {
        try {
          console.log('🔍 요청 인터셉터 시작');
          console.log('📋 현재 캐시된 세션키:', this.currentSessionKey ? 'EXISTS' : 'NULL');
          console.log('전체키  ' , await AsyncStorage.getAllKeys() )

          // 1. 캐시된 세션키 먼저 확인
          let sessionKey = this.currentSessionKey;

          // 2. 캐시가 없으면 AsyncStorage에서 읽기
          if (!sessionKey) {
            console.log('🔍 AsyncStorage에서 세션키 조회 중...');
            sessionKey = await AsyncStorage.getItem('sessionKey');

            if (sessionKey) {
              console.log('✅ AsyncStorage에서 세션키 발견:', sessionKey.substring(0, 20) + '...');
              this.currentSessionKey = sessionKey;
            } else {
              console.log('❌ AsyncStorage에 세션키 없음');

              // 🔥 전체 AsyncStorage 키 목록 확인
              const allKeys = await AsyncStorage.getAllKeys();
              console.log('📋 AsyncStorage 전체 키 목록:', allKeys);
            }
          }

          // 3. sessionKey가 있으면 헤더에 추가
          if (sessionKey) {
            config.headers.Authorization = sessionKey;
            console.log('🔑 Authorization 헤더 추가 성공');
          } else {
            console.log('⚠️ 세션키 없음 - Authorization 헤더 없이 요청');
          }

          console.log(`🔗 ${config.method?.toUpperCase()} ${config.url}`, {
            hasAuth: !!config.headers.Authorization,
            url: config.url,
          });

          return config;
        } catch (error) {
          console.error('❌ Request interceptor error:', error);
          return config;
        }
      },
      (error) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
      }
    );

    // 응답 인터셉터는 기존과 동일
    this.api.interceptors.response.use(
      (response) => {
        console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url}`, {
          status: response.status,
        });
        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        console.error(`❌ ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
          status: error.response?.status,
          message: error.response?.data?.message,
        });

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          console.log('🔄 401 에러 감지 - 세션 만료 처리');
          await this.clearAuthData();
        }

        return Promise.reject(error);
      }
    );
  }

  // 🔥 세션키 설정 - 강화된 로깅
  public async setSessionKey(sessionKey: string) {
    console.log('🔑 setSessionKey 호출됨');
    console.log('🔑 받은 세션키:', sessionKey.substring(0, 20) + '...');

    try {
      // 1. 캐시 업데이트
      this.currentSessionKey = sessionKey;
      console.log('✅ 캐시 업데이트 완료');

      // 2. defaults.headers 업데이트
      this.api.defaults.headers.Authorization = sessionKey;
      console.log('✅ defaults.headers 업데이트 완료');

      // 3. AsyncStorage 저장
      await AsyncStorage.setItem('sessionKey', sessionKey);
      console.log('✅ AsyncStorage 저장 완료');

      // 4. 저장 검증
      const savedKey = await AsyncStorage.getItem('sessionKey');
      if (savedKey === sessionKey) {
        console.log('🎉 세션키 저장/검증 성공');
      } else {
        console.error('❌ 세션키 저장 검증 실패!', {
          saved: savedKey ? savedKey.substring(0, 20) + '...' : 'NULL',
          expected: sessionKey.substring(0, 20) + '...'
        });
      }

    } catch (error) {
      console.error('❌ setSessionKey 실패:', error);
    }
  }

  // 🔥 세션키 제거 - 강화된 로깅
  public async removeSessionKey() {
    console.log('🗑️ removeSessionKey 호출됨');

    try {
      // 1. 캐시 클리어
      this.currentSessionKey = null;
      console.log('✅ 캐시 클리어 완료');

      // 2. defaults.headers 제거
      delete this.api.defaults.headers.Authorization;
      console.log('✅ defaults.headers 제거 완료');

      // 3. AsyncStorage 제거
      await AsyncStorage.removeItem('sessionKey');
      console.log('✅ AsyncStorage 제거 완료');

      // 4. 제거 검증
      const removedKey = await AsyncStorage.getItem('sessionKey');
      if (!removedKey) {
        console.log('🎉 세션키 제거 검증 성공');
      } else {
        console.error('❌ 세션키 제거 검증 실패! 여전히 존재:', removedKey);
      }

    } catch (error) {
      console.error('❌ removeSessionKey 실패:', error);
    }
  }

  // 🔥 세션키 복원 - 강화된 로깅
  public async restoreSessionKey(): Promise<void> {
    console.log('🔄 restoreSessionKey 호출됨');

    try {
      const sessionKey = await AsyncStorage.getItem('sessionKey');

      if (sessionKey) {
        console.log('🔄 세션키 복원:', sessionKey.substring(0, 20) + '...');

        this.currentSessionKey = sessionKey;
        this.api.defaults.headers.Authorization = sessionKey;

        console.log('✅ 세션키 복원 완료');

        // 복원 검증
        console.log('🔍 복원 후 상태 확인:', {
          cache: this.currentSessionKey ? 'EXISTS' : 'NULL',
          defaultHeader: this.api.defaults.headers.Authorization ? 'EXISTS' : 'NULL'
        });
      } else {
        console.log('ℹ️ 복원할 세션키 없음');

        // 전체 AsyncStorage 확인
        const allKeys = await AsyncStorage.getAllKeys();
        console.log('📋 현재 AsyncStorage 키 목록:', allKeys);
      }
    } catch (error) {
      console.error('❌ 세션키 복원 실패:', error);
    }
  }

  // 🔥 현재 상태 디버깅 메서드 추가
  public async debugCurrentState(): Promise<void> {
    console.log('🔍 === ApiClient 현재 상태 디버깅 ===');

    try {
      const asyncStorageKey = await AsyncStorage.getItem('sessionKey');
      const allKeys = await AsyncStorage.getAllKeys();

      console.log('📋 상태 정보:', {
        캐시된_세션키: this.currentSessionKey ? 'EXISTS (' + this.currentSessionKey.substring(0, 20) + '...)' : 'NULL',
        AsyncStorage_세션키: asyncStorageKey ? 'EXISTS (' + asyncStorageKey.substring(0, 20) + '...)' : 'NULL',
        defaults_header: this.api.defaults.headers.Authorization ? 'EXISTS' : 'NULL',
        AsyncStorage_전체키: allKeys
      });
    } catch (error) {
      console.error('❌ 디버깅 실패:', error);
    }

    console.log('🔍 === 디버깅 완료 ===');
  }

  public getCurrentSessionKey(): string | null {
    return this.currentSessionKey;
  }

  private async clearAuthData() {
    console.log('🧹 인증 데이터 클리어');

    await AsyncStorage.multiRemove([
      'sessionKey',
      'accessToken',
      'refreshToken',
      'user',
      'couple',
    ]);

    await this.removeSessionKey();
  }

  // 공통 요청 메서드들
  public async get<T = any>(url: string, config?: any): Promise<AxiosResponse<T>> {
    return this.api.get(url, config);
  }

  public async post<T = any>(url: string, data?: any, config?: any): Promise<AxiosResponse<T>> {
    return this.api.post(url, data, config);
  }

  public async put<T = any>(url: string, data?: any, config?: any): Promise<AxiosResponse<T>> {
    return this.api.put(url, data, config);
  }

  public async delete<T = any>(url: string, config?: any): Promise<AxiosResponse<T>> {
    return this.api.delete(url, config);
  }

  public async patch<T = any>(url: string, data?: any, config?: any): Promise<AxiosResponse<T>> {
    return this.api.patch(url, data, config);
  }
}

export const apiClient = ApiClient.getInstance();
