import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Couple, Anniversary, Schedule, BudgetItem } from '../types';
import { authService } from '../services/AuthService';
import { dashboardService, ProcessedDashboardData } from '../services/DashboardService';
import { addDays, format } from 'date-fns';
import { budgetService } from '../services/BudgetService.ts';

interface SignupData {
  username: string;
  password: string;
  nickname: string;
  email: string;
}

// 반성문 타입 정의
interface ReflectionItem {
  id: string;
  title: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  author: string;
  approver?: string;
  incident: string;
  reason: string;
  improvement: string;
}

// 🔥 반성문 Mock 데이터
const mockReflectionItems: ReflectionItem[] = [
  {
    id: '1',
    title: '늦잠으로 인한 데이트 지각 반성문',
    status: 'pending',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2시간 전
    author: '김철수',
    incident: '약속 시간보다 30분 늦게 도착하여 상대방을 기다리게 함',
    reason: '전날 늦게 자서 알람을 듣지 못하고 늦잠을 잤습니다. 약속 시간을 제대로 확인하지 않고 준비를 서둘러서 결국 늦게 되었습니다.',
    improvement: '앞으로는 데이트 전날 일찍 자고, 알람을 여러 개 설정하겠습니다. 또한 약속 시간 30분 전에는 준비를 완료하여 여유롭게 출발하겠습니다.'
  },
  {
    id: '2',
    title: '식당 예약 깜빠먹은 반성문',
    status: 'approved',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1일 전
    author: '이영희',
    approver: '김철수',
    incident: '특별한 날 식당 예약을 깜빡해서 원하는 곳에서 식사하지 못함',
    reason: '업무가 바빠서 식당 예약을 하겠다고 약속해놓고 깜빡했습니다. 당일에 가서 자리가 없다고 해서 다른 곳을 찾아다녀야 했습니다.',
    improvement: '중요한 일정은 스마트폰 리마인더에 설정하고, 예약이 필요한 일은 즉시 처리하겠습니다.'
  },
  {
    id: '3',
    title: '생일 선물 준비 못한 반성문',
    status: 'rejected',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2일 전
    author: '김철수',
    approver: '이영희',
    incident: '상대방 생일에 선물을 준비하지 못해서 실망시킴',
    reason: '미리 준비하려고 했는데 계속 미루다가 결국 생일 당일까지 아무것도 준비하지 못했습니다.',
    improvement: '앞으로는 중요한 기념일 한 달 전부터 선물을 미리 생각해보고 준비하겠습니다. 캘린더에 미리 표시해두겠습니다.'
  },
  {
    id: '4',
    title: '데이트 중 핸드폰만 본 반성문',
    status: 'approved',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // 3일 전
    author: '이영희',
    approver: '김철수',
    incident: '데이트 중에 계속 핸드폰을 보며 상대방과의 시간에 집중하지 못함',
    reason: '회사 업무 연락이 와서 확인하다 보니 습관적으로 계속 핸드폰을 보게 되었습니다.',
    improvement: '데이트 시간에는 핸드폰을 무음으로 하고 가방에 넣어두겠습니다. 긴급한 일이 아니면 데이트 후에 확인하겠습니다.'
  },
  {
    id: '5',
    title: '약속 장소 잘못 알려준 반성문',
    status: 'pending',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30분 전
    author: '김철수',
    incident: '만날 장소를 잘못 알려줘서 서로 다른 곳에서 기다리게 됨',
    reason: '비슷한 이름의 카페가 여러 개 있는데 정확한 위치를 확인하지 않고 대충 알려드렸습니다.',
    improvement: '앞으로는 약속 장소를 정할 때 정확한 주소와 함께 지도 링크를 보내드리겠습니다.'
  }
];

interface AppState {
  // 상태
  user: User | null;
  couple: Couple | null;
  anniversaries: Anniversary[];
  schedules: Schedule[];
  budgetItems: BudgetItem[];
  reflectionItems: ReflectionItem[]; // 반성문 추가
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
  setReflectionItems: (items: ReflectionItem[]) => void; // 반성문 추가

  // 대시보드 액션
  loadDashboardData: () => Promise<void>;
  refreshDashboard: () => Promise<void>;

  // 반성문 액션
  addReflectionItem: (item: Omit<ReflectionItem, 'id' | 'createdAt'>) => void;
  updateReflectionStatus: (id: string, status: 'approved' | 'rejected') => void;

  // 헬퍼 함수 - ✅ 수정된 데이터 구조에 맞게 업데이트
  getDaysFromStart: () => number;
  getUpcomingAnniversaries: () => Anniversary[];
  getTodaySchedules: () => Schedule[];
  getTomorrowSchedules: () => Schedule[];
  getThisWeekSchedules: () => Schedule[];
  getTotalBudget: () => { total: number; byUser: { [userId: string]: number } };
  getPendingReflections: () => ReflectionItem[]; // 반성문 헬퍼 추가
  getRecentReflections: () => ReflectionItem[]; // 최근 반성문 헬퍼 추가
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
      // 초기 상태 - 🔥 Mock 데이터 추가
      user: null,
      couple: null,
      anniversaries: [],
      schedules: [],
      budgetItems: [],
      reflectionItems: mockReflectionItems, // 🔥 Mock 데이터로 초기화
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
            reflectionItems: mockReflectionItems, // 🔥 로그아웃 시에도 Mock 데이터 유지
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
        set({ isLoadingDashboard: true });

        try {
          const { user, couple } = get();
          if (!user) {
            throw new Error('사용자 정보가 없습니다');
          }

          const currentMonth = format(new Date(), 'yyyy-MM');

          // 병렬로 데이터 가져오기
          const [dashboardResult, budgetResult] = await Promise.all([
            dashboardService.getDashboardData(user.id),
            budgetService.getBudgetStats(currentMonth) // ✅ 새로운 함수 사용
          ]);

          if (dashboardResult.success && dashboardResult.data) {
            // 예산 데이터도 dashboardData에 포함
            const enhancedDashboardData = {
              ...dashboardResult.data,
              budget: budgetResult.success ? budgetResult.data : { total: 0, byUser: {}, items: [] }
            };

            set({
              dashboardData: enhancedDashboardData,
              budgetItems: budgetResult.data?.items || [], // budgetItems도 업데이트
              isLoadingDashboard: false
            });
          } else {
            throw new Error(dashboardResult.message || '대시보드 데이터를 가져올 수 없습니다');
          }
        } catch (error) {
          console.error('대시보드 데이터 로드 실패:', error);
          set({
            dashboardData: null,
            isLoadingDashboard: false
          });
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
      setReflectionItems: (items) => set({ reflectionItems: items }), // 반성문 세터

      // 반성문 액션들
      addReflectionItem: (item) => {
        const newItem: ReflectionItem = {
          ...item,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
        };
        set(state => ({
          reflectionItems: [newItem, ...state.reflectionItems]
        }));
      },

      updateReflectionStatus: (id, status) => {
        set(state => ({
          reflectionItems: state.reflectionItems.map(item =>
            item.id === id ? { ...item, status } : item
          )
        }));
      },

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

        // 대시보드 데이터에서 먼저 확인
        if (dashboardData?.upcomingAnniversaries) {
          return dashboardData.upcomingAnniversaries;
        }

        // 폴백: 로컬 데이터 사용
        if (!anniversaries || anniversaries.length === 0) return [];

        const today = new Date();
        const next30Days = addDays(today, 30);

        return anniversaries
          .filter(anniversary => {
            const anniversaryDate = new Date(anniversary.date);
            return anniversaryDate >= today && anniversaryDate <= next30Days;
          })
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      },

      getTodaySchedules: () => {
        const { dashboardData, schedules } = get();

        // 대시보드 데이터에서 먼저 확인
        if (dashboardData?.todaySchedules) {
          return dashboardData.todaySchedules;
        }

        // 폴백: 로컬 데이터 사용
        if (!schedules || schedules.length === 0) return [];

        const today = format(new Date(), 'yyyy-MM-dd');
        return schedules.filter(schedule => schedule.date === today);
      },

      getTomorrowSchedules: () => {
        const { dashboardData, schedules } = get();

        // 대시보드 데이터에서 먼저 확인
        if (dashboardData?.tomorrowSchedules) {
          return dashboardData.tomorrowSchedules;
        }

        // 폴백: 로컬 데이터 사용
        if (!schedules || schedules.length === 0) return [];

        const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd');
        return schedules.filter(schedule => schedule.date === tomorrow);
      },

      getThisWeekSchedules: () => {
        const { schedules } = get();
        if (!schedules || schedules.length === 0) return [];

        const today = new Date();
        const thisWeekStart = new Date(today.setDate(today.getDate() - today.getDay()));
        const thisWeekEnd = new Date(today.setDate(today.getDate() - today.getDay() + 6));

        return schedules.filter(schedule => {
          const scheduleDate = new Date(schedule.date);
          return scheduleDate >= thisWeekStart && scheduleDate <= thisWeekEnd;
        });
      },

      getTotalBudget: () => {
        const { dashboardData } = get();

        // ✅ dashboardData에서 budget 정보 가져오기
        if (dashboardData?.budget) {
          return dashboardData.budget;
        }

        // ✅ fallback으로 budgetItems에서 계산
        const { budgetItems } = get();
        if (!budgetItems || budgetItems.length === 0) {
          return { total: 0, byUser: {} };
        }

        const currentMonth = format(new Date(), 'yyyy-MM');
        const thisMonthItems = budgetItems.filter(item =>
          item.expenseDate && item.expenseDate.startsWith(currentMonth) // ✅ expenseDate 사용
        );

        const total = thisMonthItems.reduce((sum, item) => sum + item.amount, 0);

        const byUser: { [userId: string]: number } = {};
        thisMonthItems.forEach(item => {
          if (!byUser[item.paidBy]) {
            byUser[item.paidBy] = 0;
          }
          byUser[item.paidBy] += item.amount;
        });

        return { total, byUser };
      },


      // 🔥 반성문 헬퍼 함수들 추가
      getPendingReflections: () => {
        const { reflectionItems } = get();
        return reflectionItems.filter(item => item.status === 'pending');
      },

      getRecentReflections: () => {
        const { reflectionItems } = get();
        return reflectionItems
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 3); // 최근 3개만
      },
    }),
    {
      name: 'app-store',
      partialize: (state) => ({
        user: state.user,
        couple: state.couple,
        anniversaries: state.anniversaries,
        schedules: state.schedules,
        budgetItems: state.budgetItems,
        reflectionItems: state.reflectionItems, // 🔥 반성문도 영구 저장
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
