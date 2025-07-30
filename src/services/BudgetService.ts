import { AxiosResponse } from 'axios';
import { API_ENDPOINTS } from '../constants/config';
import { apiClient } from './ApiClient';
import { BudgetItem } from '../types';

// API 응답 데이터 타입 정의
interface BackendResponse<T = any> {
  success: boolean;
  message: string;
  code: string;
  data: T;
  timestamp: number;
}

export interface BudgetItemsResponse {
  items: BudgetItem[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

class BudgetService {
  /**
   * 예산 항목 가져오기
   * @param month 월 정보 (yyyymm 형식)
   * @returns 예산 항목 목록
   */
  async getBudgetItems(month: string): Promise<ApiResponse<BudgetItem[]>> {
    try {
      const response: AxiosResponse<BackendResponse<BudgetItem[]>> = await apiClient.get(
        `${API_ENDPOINTS.budget.list}?month=${month}`
      );

      if (response.data.success && response.data.code === '200') {
        // ✅ 항상 배열 반환 보장
        return {
          success: true,
          data: response.data.data || [], // data가 없으면 빈 배열 반환
        };
      }

      return {
        success: false,
        message: response.data.message || '예산 데이터를 가져오는데 실패했습니다.',
        data: [],
      };
    } catch (error: any) {
      console.error('Budget API error:', error);

      return {
        success: false,
        message: error.response?.data?.message || '네트워크 오류가 발생했습니다.',
        data: [], // 오류 시에도 빈 배열 반환
      };
    }
  }

  /**
   * 예산 항목 등록하기
   * @param budgetItem 등록할 예산 항목 데이터
   * @returns 등록 결과 응답
   */
  async addBudgetItem(budgetItem: Omit<BudgetItem, 'id'>): Promise<ApiResponse<BudgetItem>> {
    try {
      const response: AxiosResponse<BackendResponse<BudgetItem>> = await apiClient.post(
        `${API_ENDPOINTS.budget.create}`, // 생성 endpoint
        budgetItem
      );

      console.log('addBudgetItem response:', response);

      if (response.data.success && response.data.code === '200') {
        return {
          success: true,
          data: response.data.data,
        };
      }

      return {
        success: false,
        message: response.data.message || '지출 등록에 실패했습니다.',
      };
    } catch (error: any) {
      console.error('지출 등록 에러:', error);

      return {
        success: false,
        message: error.response?.data?.message || '네트워크 오류가 발생했습니다.',
      };
    }
  }


}

// 인스턴스 생성 및 내보내기
export const budgetService = new BudgetService();
