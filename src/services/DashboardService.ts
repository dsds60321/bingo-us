import { AxiosResponse } from 'axios';
import { API_ENDPOINTS } from '../constants/config';
import { apiClient } from './ApiClient';
import { format, addDays, startOfMonth, endOfMonth, isAfter, isBefore } from 'date-fns';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 타입 정의 - 백엔드 응답 구조에 맞게 수정
export interface DashboardData {
  anniversaries: Anniversary[];          // ✅ upcomingAnniversaries → anniversaries
  schedules: Schedule[];                 // ✅ todaySchedules, tomorrowSchedules → schedules
  completedTasksThisWeek: number;
  pendingTasksCount: number;
  stats: DashboardStats;
}

// 클라이언트에서 사용할 가공된 데이터 타입
export interface ProcessedDashboardData {
  anniversaries: Anniversary[];
  upcomingAnniversaries: Anniversary[];  // 다가오는 기념일만 필터링
  allSchedules: Schedule[];              // 전체 일정
  todaySchedules: Schedule[];            // 오늘 일정
  tomorrowSchedules: Schedule[];         // 내일 일정
  thisWeekSchedules: Schedule[];         // 이번 주 일정
  completedTasksThisWeek: number;
  pendingTasksCount: number;
  stats: DashboardStats;
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

export interface Schedule {
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


export interface DashboardStats {
  totalAnniversaries: number;
  completedTasksThisMonth: number;
  pendingTasks: number;
  thisMonthTasks: number;
  daysFromStart: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// 백엔드 응답 구조
export interface BackendResponse<T = any> {
  code: string;
  message: string;
  description: string;
  timestamp: string;
  data: T;
}

class DashboardService {
  // 🎯 Dashboard 메인 데이터 가져오기 및 가공
  async getDashboardData(): Promise<ApiResponse<ProcessedDashboardData>> {
    try {

      const sessionKey = await AsyncStorage.getItem('sessionKey');
      console.log('🔑 가져온 세션키:', sessionKey ? sessionKey.substring(0, 20) + '...' : 'NULL');


      // 통합 대시보드 API 호출
      const response: AxiosResponse<BackendResponse<DashboardData>> = await apiClient.get(
        API_ENDPOINTS.dashboard.main
      );

      console.log('DashboardService Get dashboard data response:', response.data);

      if (response.data.code === '200') {
        const rawData = response.data.data;

        // 🔄 백엔드 데이터를 클라이언트용으로 가공
        const processedData = this.processDashboardData(rawData);

        return {
          success: true,
          data: processedData,
        };
      }

      return {
        success: false,
        message: response.data.message || '대시보드 데이터를 불러오는데 실패했습니다.',
      };
    } catch (error: any) {
      console.error('Dashboard data error:', error);

      // 실패 시 개별 API 호출로 폴백
      return await this.getDashboardDataFallback();
    }
  }

  // 🔄 백엔드 데이터를 클라이언트용으로 가공하는 함수
  private processDashboardData(rawData: DashboardData): ProcessedDashboardData {
    console.log('processDashboardData', rawData)
    const today = format(new Date(), 'yyyy-MM-dd');
    const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd');
    const weekEnd = format(addDays(new Date(), 7), 'yyyy-MM-dd');
    const todayDate = new Date();

    // 기념일 필터링: 오늘 이후의 기념일만 날짜순으로 최근 5개
    const upcomingAnniversaries = rawData.anniversaries
      .filter((ann: Anniversary) => {
        const annDate = new Date(ann.date);
        return isAfter(annDate, todayDate) || annDate.toDateString() === todayDate.toDateString(); // 오늘 포함
      })
      .sort((a: Anniversary, b: Anniversary) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
      )
      .slice(0, 5); // 최대 5개

    // 일정 날짜별 필터링
    const todaySchedules = rawData.schedules.filter(
      schedule => schedule.dueDate === today
    );

    const tomorrowSchedules = rawData.schedules.filter(
      schedule => schedule.dueDate === tomorrow
    );

    const thisWeekSchedules = rawData.schedules.filter(
      schedule => schedule.dueDate >= today && schedule.dueDate <= weekEnd
    );

    console.log('tkwjtikwet today ' ,todaySchedules)
    return {
      anniversaries: rawData.anniversaries,           // 전체 기념일
      upcomingAnniversaries,                          // 다가오는 기념일 (필터링됨)
      allSchedules: rawData.schedules,                // 전체 일정
      todaySchedules,                                 // 오늘 일정
      tomorrowSchedules,                              // 내일 일정
      thisWeekSchedules,                              // 이번 주 일정
      completedTasksThisWeek: rawData.completedTasksThisWeek,
      pendingTasksCount: rawData.pendingTasksCount,
      stats: rawData.stats,
    };
  }

  // 🔄 폴백: 개별 API 호출로 대시보드 데이터 구성
  private async getDashboardDataFallback(): Promise<ApiResponse<ProcessedDashboardData>> {
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd');

      // 동시에 모든 데이터 요청
      const [anniversariesResult, schedulesResult] = await Promise.all([
        this.getAnniversaries(),  // ✅ 전체 기념일 가져오기
        this.getSchedules()
      ]);

      if (!anniversariesResult.success || !schedulesResult.success) {
        return {
          success: false,
          message: '대시보드 데이터를 불러오는데 실패했습니다.',
        };
      }

      const allAnniversaries = anniversariesResult.data || [];
      const allSchedules = schedulesResult.data || [];

      // 폴백 데이터를 가공
      const fallbackData: DashboardData = {
        anniversaries: allAnniversaries,
        schedules: allSchedules,
        completedTasksThisWeek: allSchedules.filter(
          schedule =>
            schedule.status === 'completed' &&
            schedule.completedAt &&
            schedule.completedAt >= format(addDays(new Date(), -7), 'yyyy-MM-dd') &&
            schedule.completedAt <= today
        ).length,
        pendingTasksCount: allSchedules.filter(
          schedule => schedule.status === 'pending'
        ).length,
        stats: {
          totalAnniversaries: allAnniversaries.length,
          completedTasksThisMonth: allSchedules.filter(
            s => s.status === 'completed' &&
              s.completedAt?.startsWith(format(new Date(), 'yyyy-MM'))
          ).length,
          pendingTasks: allSchedules.filter(s => s.status === 'pending').length,
          thisMonthTasks: allSchedules.filter(
            s => s.createdAt?.startsWith(format(new Date(), 'yyyy-MM'))
          ).length,
          daysFromStart: 0, // 커플 정보에서 계산 필요
        },
      };

      const processedData = this.processDashboardData(fallbackData);

      return {
        success: true,
        data: processedData,
      };
    } catch (error: any) {
      console.error('Dashboard fallback error:', error);
      return {
        success: false,
        message: '대시보드 데이터 조회 중 오류가 발생했습니다.',
      };
    }
  }

  // 🎉 전체 기념일 가져오기 (필터링 없음)
  async getAnniversaries(): Promise<ApiResponse<Anniversary[]>> {
    try {
      const response: AxiosResponse<BackendResponse<Anniversary[]>> = await apiClient.get(
        API_ENDPOINTS.anniversary.list
      );

      if (response.data.code === '200') {
        return {
          success: true,
          data: response.data.data || [],
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
        message: '기념일 조회 중 오류가 발생했습니다.',
      };
    }
  }

  // 📅 일정 가져오기 (todos 테이블에서)
  async getSchedules(startDate?: string, endDate?: string): Promise<ApiResponse<Schedule[]>> {
    try {
      // 기본값: 이번 달 전체
      const start = startDate || format(startOfMonth(new Date()), 'yyyy-MM-dd');
      const end = endDate || format(endOfMonth(addDays(new Date(), 30)), 'yyyy-MM-dd');

      const response: AxiosResponse<BackendResponse<any[]>> = await apiClient.get(
        `${API_ENDPOINTS.schedule?.list || '/api/todos'}?startDate=${start}&endDate=${end}`
      );

      if (response.data.code === '200' || response.data.data) {
        const todos = response.data.data || [];

        // todos를 Schedule 형태로 변환
        const schedules: Schedule[] = todos.map((todo: any) => ({
          id: todo.id,
          title: todo.title,
          description: todo.description,
          date: todo.created_at ? format(new Date(todo.created_at), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
          location: todo.location,
          priority: todo.priority || 'medium',
          status: todo.status || 'pending',
          assignedTo: todo.assigned_to,
          category: todo.category,
          estimatedDuration: todo.estimated_duration,
          tags: todo.tags ? JSON.parse(todo.tags) : [],
          completedAt: todo.completed_at,
          completedBy: todo.completed_by,
          createdBy: todo.created_by,
          createdAt: todo.created_at,
          updatedAt: todo.updated_at,
        }));

        return {
          success: true,
          data: schedules,
        };
      }

      return {
        success: false,
        message: '일정 목록을 불러오는데 실패했습니다.',
      };
    } catch (error: any) {
      console.error('Get schedules error:', error);
      return {
        success: false,
        message: '일정 조회 중 오류가 발생했습니다.',
      };
    }
  }

  // 📊 통계 데이터만 가져오기
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    try {
      const response: AxiosResponse<BackendResponse<DashboardStats>> = await apiClient.get(
        API_ENDPOINTS.dashboard.stats
      );

      if (response.data.code === '200') {
        return {
          success: true,
          data: response.data.data,
        };
      }

      return {
        success: false,
        message: '통계 데이터를 불러오는데 실패했습니다.',
      };
    } catch (error: any) {
      console.error('Get dashboard stats error:', error);
      return {
        success: false,
        message: '통계 조회 중 오류가 발생했습니다.',
      };
    }
  }
}

export const dashboardService = new DashboardService();
