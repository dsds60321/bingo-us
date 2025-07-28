import { AxiosResponse } from 'axios';
import { API_ENDPOINTS } from '../constants/config';
import { apiClient } from './ApiClient';

// 타입 정의
export interface CreateAnniversaryRequest {
  type: 'ANNIVERSARY' | 'BIRTHDAY' | 'CUSTOM';
  title: string;
  date: string; // YYYY-MM-DD 형식
  isContinue: number; // 0 또는 1 (매년 반복 여부)
  isPrivate: number; // 0 고정
  description?: string;
}

export interface Anniversary {
  id: string;
  type: 'ANNIVERSARY' | 'BIRTHDAY' | 'CUSTOM';
  title: string;
  date: string;
  isContinue: number;
  isPrivate: number;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

// 백엔드 응답 구조
export interface BackendResponse<T = any> {
  code: string;
  message: string;
  description: string;
  timestamp: string;
  data: T;
}

export interface AnniversaryResponse {
  success: boolean;
  message: string;
  errorCode: string | null;
  data?: Anniversary;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

class AnniversaryService {
  // 🔥 공통 apiClient 사용으로 간소화

  // 기념일 생성
  async createAnniversary(anniversaryData: CreateAnniversaryRequest): Promise<ApiResponse<Anniversary>> {
    try {
      console.log('Creating anniversary:', anniversaryData);

      const response: AxiosResponse<BackendResponse<AnniversaryResponse>> = await apiClient.post(
        API_ENDPOINTS.anniversary.create,
        anniversaryData
      );

      console.log('Create anniversary response:', response.data);

      // 백엔드 응답 구조에 맞게 처리
      if (response.data.code === '200' && response.data.success) {
        return {
          success: true,
          message: response.data.message
        };
      }

      return {
        success: false,
        message: response.data.message || '기념일 등록에 실패했습니다.',
      };
    } catch (error: any) {
      console.error('Create anniversary error:', error);

      if (error.response?.data?.message) {
        return {
          success: false,
          message: error.response.data.message,
        };
      }

      return {
        success: false,
        message: '기념일 등록 중 오류가 발생했습니다.',
      };
    }
  }

  // 기념일 목록 조회
  async getAnniversaries(): Promise<ApiResponse<Anniversary[]>> {
    try {
      const response: AxiosResponse<BackendResponse<Anniversary[]>> = await apiClient.get(
        API_ENDPOINTS.anniversary.list
      );

      if (response.data.code === '200') {
        return {
          success: true,
          data: response.data.data,
        };
      }

      return {
        success: false,
        message: '기념일 목록을 불러오는데 실패했습니다.',
      };
    } catch (error: any) {
      console.error('Get anniversaries error:', error);
      return {
        success: false,
        message: '기념일 목록 조회 중 오류가 발생했습니다.',
      };
    }
  }

  // 기념일 수정
  async updateAnniversary(id: string, anniversaryData: Partial<CreateAnniversaryRequest>): Promise<ApiResponse<Anniversary>> {
    try {
      const response: AxiosResponse<BackendResponse<AnniversaryResponse>> = await apiClient.put(
        `${API_ENDPOINTS.anniversary.update}/${id}`,
        anniversaryData
      );

      if (response.data.code === '200' && response.data.data.success) {
        return {
          success: true,
          message: response.data.data.message,
          data: response.data.data.data,
        };
      }

      return {
        success: false,
        message: response.data.data.message || '기념일 수정에 실패했습니다.',
      };
    } catch (error: any) {
      console.error('Update anniversary error:', error);
      return {
        success: false,
        message: '기념일 수정 중 오류가 발생했습니다.',
      };
    }
  }

  // 기념일 삭제
  async deleteAnniversary(id: string): Promise<ApiResponse> {
    try {
      const response: AxiosResponse<BackendResponse<any>> = await apiClient.delete(
        `${API_ENDPOINTS.anniversary.delete}/${id}`
      );

      if (response.data.code === '200') {
        return {
          success: true,
          message: '기념일이 삭제되었습니다.',
        };
      }

      return {
        success: false,
        message: '기념일 삭제에 실패했습니다.',
      };
    } catch (error: any) {
      console.error('Delete anniversary error:', error);
      return {
        success: false,
        message: '기념일 삭제 중 오류가 발생했습니다.',
      };
    }
  }
}

// 싱글톤 인스턴스 export
export const anniversaryService = new AnniversaryService();
