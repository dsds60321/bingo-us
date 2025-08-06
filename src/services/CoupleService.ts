import { AxiosResponse } from 'axios';
import { API_ENDPOINTS } from '../constants/config';
import { apiClient } from './ApiClient';

// 타입 정의
export interface CoupleInviteResponse {
  success: boolean;
  message: string;
  code: string;
  timestamp: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

class CoupleService {
  /**
   * 커플 초대 링크 생성
   * @returns 초대 링크가 포함된 응답
   */
  async generateInviteLink(): Promise<ApiResponse<string>> {
    try {
      console.log('Generating couple invite link...');

      const response: AxiosResponse<CoupleInviteResponse> = await apiClient.get(
        API_ENDPOINTS.couple.link || '/couple/link'
      );

      console.log('Couple invite response:', response.data);

      if (response.data.success && response.data.code === '200') {
        return {
          success: true,
          data: response.data.message, // message에 링크가 들어있음
          message: '초대 링크가 생성되었습니다.',
        };
      }

      return {
        success: false,
        message: response.data.message || '초대 링크 생성에 실패했습니다.',
      };
    } catch (error: any) {
      console.error('Generate invite link error:', error);
      return {
        success: false,
        message: error.response?.data?.message || '초대 링크 생성 중 오류가 발생했습니다.',
      };
    }
  }
}

// 싱글톤 인스턴스 export
export const coupleService = new CoupleService();
