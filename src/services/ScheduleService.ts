import { AxiosResponse } from 'axios';
import { API_ENDPOINTS } from '../constants/config';
import { apiClient } from './ApiClient';

// ✅ DDL에 맞게 할일 항목 타입 정의 수정
export interface ScheduleItem {
  id?: string;                    // bigint(10) auto_increment
  couple_id?: string;             // varchar(36) not null - 서버에서 자동 설정
  title: string;                  // varchar(200) not null
  description?: string;           // text null
  priority: 'low' | 'medium' | 'high';  // enum ('low', 'medium', 'high')
  completed?: boolean;            // tinyint(1) default 0
  created_by?: string;            // varchar(36) not null - 서버에서 자동 설정
  created_at?: string;            // timestamp default current_timestamp()
  updated_at?: string;            // timestamp default current_timestamp() on update
  due_date?: string;              // date null (yyyy-MM-dd 형식)
  due_time?: string;              // time null (HH:mm:ss 형식)
}

// 할일 등록 시 사용할 입력 데이터 타입
export interface ScheduleCreateInput {
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  due_date?: string;              // yyyy-MM-dd 형식
  due_time?: string;              // HH:mm 형식 (서버에서 HH:mm:ss로 변환)
}

// API 응답 데이터 타입 정의
interface BackendResponse<T = any> {
  success: boolean;
  message: string;
  code: string;
  data: T;
  timestamp: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

class ScheduleService {
  /**
   * ✅ DDL에 맞게 할일 항목 등록하기 수정
   * @param scheduleInput 등록할 할일 항목 데이터
   * @returns 등록 결과 응답
   */
  async addScheduleItem(scheduleInput: ScheduleCreateInput): Promise<ApiResponse<ScheduleItem>> {
    try {
      // ✅ due_time이 있으면 HH:mm:ss 형식으로 변환
      const requestData = {
        ...scheduleInput,
        due_time: scheduleInput.due_time ? `${scheduleInput.due_time}:00` : undefined
      };

      const response: AxiosResponse<BackendResponse<ScheduleItem>> = await apiClient.post(
        '/schedules', // ✅ POST /schedules 엔드포인트 (테이블명과 일치)
        requestData
      );

      if (response.data.success && response.data.code === '200') {
        return {
          success: true,
          data: response.data.data,
        };
      }

      return {
        success: false,
        message: response.data.message || '할일 등록에 실패했습니다.',
      };
    } catch (error: any) {
      console.error('할일 등록 에러:', error);

      return {
        success: false,
        message: error.response?.data?.message || '네트워크 오류가 발생했습니다.',
      };
    }
  }

  /**
   * ✅ DDL에 맞게 할일 목록 가져오기 수정
   * @param startDate 시작 날짜 (yyyy-MM-dd 형식)
   * @param endDate 종료 날짜 (yyyy-MM-dd 형식)
   * @returns 할일 항목 목록
   */
  async getScheduleItems(startDate?: string, endDate?: string): Promise<ApiResponse<ScheduleItem[]>> {
    try {
      let url = '/schedules';
      const params = [];

      if (startDate) params.push(`startDate=${startDate}`);
      if (endDate) params.push(`endDate=${endDate}`);

      if (params.length > 0) {
        url += `?${params.join('&')}`;
      }

      const response: AxiosResponse<BackendResponse<ScheduleItem[]>> = await apiClient.get(url);

      if (response.data.success && response.data.code === '200') {
        // ✅ completed를 boolean으로 변환
        const schedules = (response.data.data || []).map(schedule => ({
          ...schedule,
          completed: Boolean(schedule.completed)
        }));

        return {
          success: true,
          data: schedules,
        };
      }

      return {
        success: false,
        message: response.data.message || '할일 데이터를 가져오는데 실패했습니다.',
        data: [],
      };
    } catch (error: any) {
      console.error('Schedule list API error:', error);

      return {
        success: false,
        message: error.response?.data?.message || '네트워크 오류가 발생했습니다.',
        data: [],
      };
    }
  }

  /**
   * ✅ DDL에 맞게 할일 완료 상태 업데이트 수정
   * @param scheduleId 할일 ID
   * @param completed 완료 여부
   * @returns 업데이트 결과 응답
   */
  async updateScheduleStatus(scheduleId: string, completed: boolean): Promise<ApiResponse<ScheduleItem>> {
    try {
      const response: AxiosResponse<BackendResponse<ScheduleItem>> = await apiClient.patch(
        `/schedules/${scheduleId}`,
        { completed }
      );

      if (response.data.success && response.data.code === '200') {
        return {
          success: true,
          data: {
            ...response.data.data,
            completed: Boolean(response.data.data.completed) // boolean 변환
          },
        };
      }

      return {
        success: false,
        message: response.data.message || '할일 상태 업데이트에 실패했습니다.',
      };
    } catch (error: any) {
      console.error('할일 상태 업데이트 에러:', error);

      return {
        success: false,
        message: error.response?.data?.message || '네트워크 오류가 발생했습니다.',
      };
    }
  }

  /**
   * ✅ 할일 항목 수정하기
   * @param scheduleId 할일 ID
   * @param updateData 수정할 데이터
   * @returns 수정 결과 응답
   */
  async updateScheduleItem(scheduleId: string, updateData: Partial<ScheduleCreateInput>): Promise<ApiResponse<ScheduleItem>> {
    try {
      // ✅ due_time이 있으면 HH:mm:ss 형식으로 변환
      const requestData = {
        ...updateData,
        due_time: updateData.due_time ? `${updateData.due_time}:00` : undefined
      };

      const response: AxiosResponse<BackendResponse<ScheduleItem>> = await apiClient.put(
        `/schedules/${scheduleId}`,
        requestData
      );

      if (response.data.success && response.data.code === '200') {
        return {
          success: true,
          data: {
            ...response.data.data,
            completed: Boolean(response.data.data.completed)
          },
        };
      }

      return {
        success: false,
        message: response.data.message || '할일 수정에 실패했습니다.',
      };
    } catch (error: any) {
      console.error('할일 수정 에러:', error);

      return {
        success: false,
        message: error.response?.data?.message || '네트워크 오류가 발생했습니다.',
      };
    }
  }

}

// 인스턴스 생성 및 내보내기
export const scheduleService = new ScheduleService();
