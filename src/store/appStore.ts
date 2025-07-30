import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Couple, Anniversary, Schedule, BudgetItem } from '../types';
import { authService } from '../services/AuthService';
import { dashboardService, ProcessedDashboardData } from '../services/DashboardService';

interface SignupData {
  username: string;
  password: string;
  nickname: string;
  email: string;
}

interface AppState {
  // 상태
  user: User | null;
  couple: Couple | null;
  anniversaries: Anniversary[];
  schedules: Schedule[];
  budgetItems: BudgetItem[];
  isAuthenticated: boolean;
  isLoading: boolean;

  // 대시보드 관련 - ✅ 수정된 타입 사용
  dashboardData: ProcessedDashboardData | null;
  isLoadingDashboard: boolean;

  // 인증 액션
  login: (id: string, password: string) => Promise<boolean>;
  signup: (data: SignupData) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;

  // 데이터 액션
  setUser: (user: User) => void;
  setCouple: (couple: Couple) => void;
  setAnniversaries: (anniversaries: Anniversary[]) => void;
  setSchedules: (schedules: Schedule[]) => void;
  setBudgetItems: (budgetItems: BudgetItem[]) => void;

  // 대시보드 액션
  loadDashboardData: () => Promise<void>;
  refreshDashboard: () => Promise<void>;

  // 헬퍼 함수 - ✅ 수정된 데이터 구조에 맞게 업데이트
  getDaysFromStart: () => number;
  getUpcomingAnniversaries: () => Anniversary[];
  getTodaySchedules: () => Schedule[];
  getTomorrowSchedules: () => Schedule[];
  getThisWeekSchedules: () => Schedule[];
  getTotalBudget: () => { total: number; byUser: { [userId: string]: number } };
}

// 백엔드 couple 응답 구조에 맞게 변환 함수
const transformCoupleData = (backendCouple: any, currentUserId: string): Couple => {
  console.log('backendCouple:', backendCouple);
  const users = [
    {
      id: backendCouple.inviterId,
      name: backendCouple.inviterId === currentUserId ? '나' : '파트너',
      email: '',
    },
    {
      id: backendCouple.inviteeId,
      name: backendCouple.inviteeId === currentUserId ? '나' : '파트너',
      email: '',
    }
  ];

  return {
    id: backendCouple.id.toString(),
    users: users,
    startDate: backendCouple.startDate,
    createdAt: backendCouple.createdAt,
    coupleName: backendCouple.coupleName,
    profileImageUrl: undefined,
    description: undefined,
  };
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // 초기 상태
      user: null,
      couple: null,
      anniversaries: [],
      schedules: [],
      budgetItems: [],
      isAuthenticated: false,
      isLoading: false,
      dashboardData: null,
      isLoadingDashboard: false,

      // 🔐 로그인 함수
      login: async (id: string, password: string) => {
        set({ isLoading: true });

        try {
          const result = await authService.login({ id, password });
          console.log('로그인 응답:', result);

          if (result.success && result.data) {
            const userData: User = {
              id: result.data.user.id,
              name: result.data.user.nickname,
              email: result.data.user.email,
            };

            let coupleData: Couple | null = null;

            if (result.data.couple) {
              coupleData = transformCoupleData(result.data.couple, result.data.user.id);
              console.log('변환된 커플 데이터:', coupleData);
            }

            set({
              user: userData,
              couple: coupleData,
              isAuthenticated: true,
              isLoading: false
            });

            // 로그인 성공 후 대시보드 데이터 로드
            get().loadDashboardData();

            return true;
          } else {
            set({ isLoading: false });
            console.error('로그인 실패:', result.message);
            return false;
          }
        } catch (error) {
          set({ isLoading: false });
          console.error('로그인 오류:', error);
          return false;
        }
      },

      // 📝 회원가입 함수
      signup: async (data: SignupData) => {
        set({ isLoading: true });

        try {
          const result = await authService.signUp(data);

          if (result.success) {
            set({ isLoading: false });
            return true;
          } else {
            set({ isLoading: false });
            console.error('회원가입 실패:', result.message);
            return false;
          }
        } catch (error) {
          set({ isLoading: false });
          console.error('회원가입 오류:', error);
          return false;
        }
      },

      // 🚪 로그아웃 함수
      logout: async () => {
        try {
          await authService.logout();
        } catch (error) {
          console.error('로그아웃 오류:', error);
        } finally {
          set({
            user: null,
            couple: null,
            anniversaries: [],
            schedules: [],
            budgetItems: [],
            dashboardData: null,
            isAuthenticated: false,
          });
        }
      },

      // 🔍 인증 상태 확인 - 앱 시작 시 호출
      checkAuthStatus: async () => {
        try {
          // 🔥 먼저 세션 복원
          await authService.restoreSession();

          const isAuthenticated = await authService.isAuthenticated();

          if (isAuthenticated) {
            const storedUser = await authService.getStoredUser();

            if (storedUser) {
              const userData: User = {
                id: storedUser.id,
                name: storedUser.nickname,
                email: storedUser.email,
              };

              const storedCouple = await authService.getStoredCouple();
              let coupleData: Couple | null = null;

              if (storedCouple) {
                coupleData = transformCoupleData(storedCouple, storedUser.id);
              }

              set({
                user: userData,
                couple: coupleData,
                isAuthenticated: true,
              });

              // 인증 확인 후 대시보드 데이터 로드
              get().loadDashboardData();
            }
          } else {
            set({
              user: null,
              couple: null,
              isAuthenticated: false,
            });
          }
        } catch (error) {
          console.error('인증 상태 확인 오류:', error);
          set({
            user: null,
            couple: null,
            isAuthenticated: false,
          });
        }
      },

      // 🎯 대시보드 데이터 로드 - ✅ 수정된 구조에 맞게 업데이트
      loadDashboardData: async () => {
        const { isAuthenticated } = get();
        console.log('🔍 loadDashboardData 시작:', { isAuthenticated });

        if (!isAuthenticated) return;

        set({ isLoadingDashboard: true });

        try {
          console.log('📡 dashboardService.getDashboardData 호출 중...');
          const result = await dashboardService.getDashboardData();
          console.log('----- result ----', result)
          console.log('📨 dashboardService 응답:', {
            success: result.success,
            hasData: !!result.data,
            upcomingAnniversaries: result.data?.upcomingAnniversaries?.length,
            todaySchedules: result.data?.todaySchedules?.length,
            tomorrowSchedules: result.data?.tomorrowSchedules?.length,
          });

          if (result.success && result.data) {
            console.log('✅ 대시보드 데이터 저장 중...');
            set({
              dashboardData: result.data,
              anniversaries: result.data.anniversaries,
              schedules: result.data.allSchedules,
            });
            console.log('✅ 대시보드 데이터 저장 완료');
          } else {
            console.error('❌ 대시보드 데이터 로드 실패:', result.message);
          }
        } catch (error) {
          console.error('💥 Dashboard load error:', error);
        } finally {
          set({ isLoadingDashboard: false });
          console.log('🏁 loadDashboardData 완료');
        }
      },


      // 🔄 대시보드 새로 고침
      refreshDashboard: async () => {
        await get().loadDashboardData();
      },

      // 기존 액션들
      setUser: (user) => set({ user }),
      setCouple: (couple) => set({ couple }),
      setAnniversaries: (anniversaries) => set({ anniversaries }),
      setSchedules: (schedules) => set({ schedules }),
      setBudgetItems: (budgetItems) => set({ budgetItems }),

      // ✅ 헬퍼 함수들 - 수정된 구조에 맞게 업데이트
      getDaysFromStart: () => {
        const { couple, dashboardData } = get();

        // 대시보드 데이터에서 먼저 확인
        if (dashboardData?.stats?.daysFromStart) {
          return dashboardData.stats.daysFromStart;
        }

        // 폴백: 로컬 계산
        if (!couple || !couple.startDate) return 0;

        const startDate = new Date(couple.startDate);
        const today = new Date();
        const diffTime = Math.abs(today.getTime() - startDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
      },

      getUpcomingAnniversaries: () => {
        const { dashboardData, anniversaries } = get();

        // 대시보드 데이터에서 먼저 확인 (이미 필터링됨)
        if (dashboardData?.upcomingAnniversaries) {
          return dashboardData.upcomingAnniversaries;
        }

        // 폴백: 로컬 계산
        const today = new Date();
        return anniversaries
          .filter(ann => new Date(ann.date) >= today)
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .slice(0, 3);
      },

      getTodaySchedules: () => {
        const { dashboardData, schedules } = get();

        // 대시보드 데이터에서 먼저 확인
        if (dashboardData?.todaySchedules) {
          return dashboardData.todaySchedules;
        }

        // 폴백: 로컬 계산
        const today = new Date().toISOString().split('T')[0];
        return schedules.filter(schedule => schedule.date === today);
      },

      // ✅ 새로 추가된 헬퍼 함수들
      getTomorrowSchedules: () => {
        const { dashboardData, schedules } = get();

        // 대시보드 데이터에서 먼저 확인
        if (dashboardData?.tomorrowSchedules) {
          return dashboardData.tomorrowSchedules;
        }

        // 폴백: 로컬 계산
        const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd');
        return schedules.filter(schedule => schedule.date === tomorrow);
      },

      getThisWeekSchedules: () => {
        const { dashboardData, schedules } = get();

        // 대시보드 데이터에서 먼저 확인
        if (dashboardData?.thisWeekSchedules) {
          return dashboardData.thisWeekSchedules;
        }

        // 폴백: 로컬 계산
        const today = format(new Date(), 'yyyy-MM-dd');
        const weekEnd = format(addDays(new Date(), 7), 'yyyy-MM-dd');
        return schedules.filter(schedule => schedule.date >= today && schedule.date <= weekEnd);
      },

      getTotalBudget: () => {
        const { budgetItems } = get();

        const total = budgetItems.reduce((sum, item) => sum + item.amount, 0);
        const byUser: { [userId: string]: number } = {};

        budgetItems.forEach(item => {
          if (!byUser[item.paidBy]) {
            byUser[item.paidBy] = 0;
          }
          byUser[item.paidBy] += item.amount;
        });

        return { total, byUser };
      },
    }),
    {
      name: 'app-storage',
      partialize: (state) => ({
        user: state.user,
        couple: state.couple,
        isAuthenticated: state.isAuthenticated,
        anniversaries: state.anniversaries,
        schedules: state.schedules,
        budgetItems: state.budgetItems,
      }),
    }
  )
);
