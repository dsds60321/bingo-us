import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Couple, Anniversary, Schedule, BudgetItem } from '../types';

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

  // 인증 액션
  login: (username: string, password: string) => Promise<boolean>;
  signup: (data: SignupData) => Promise<boolean>;
  logout: () => void;

  // 기존 액션
  setUser: (user: User) => void;
  setCouple: (couple: Couple) => void;
  setAnniversaries: (anniversaries: Anniversary[]) => void;
  setSchedules: (schedules: Schedule[]) => void;
  setBudgetItems: (budgetItems: BudgetItem[]) => void;

  // 헬퍼 함수
  getDaysFromStart: () => number;
  getUpcomingAnniversaries: () => Anniversary[];
  getTodaySchedules: () => Schedule[];
  getTotalBudget: () => { total: number; byUser: { [userId: string]: number } };
}

// 임시 사용자 데이터베이스 (실제 앱에서는 서버 API 사용)
const mockUsers = [
  {
    id: 'user1',
    username: 'demo1',
    password: 'password123',
    name: '김철수',
    email: 'demo1@example.com',
  },
  {
    id: 'user2',
    username: 'demo2',
    password: 'password123',
    name: '이영희',
    email: 'demo2@example.com',
  }
];

// 임시 커플 데이터
const mockCouples = [
  {
    id: 'couple1',
    users: [
      {
        id: 'user1',
        name: '김철수',
        email: 'demo1@example.com',
      },
      {
        id: 'user2',
        name: '이영희',
        email: 'demo2@example.com',
      }
    ],
    startDate: '2025-01-01',
    createdAt: new Date().toISOString(),
  }
];

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // 초기 상태 - 로그인되지 않은 상태로 변경
      user: null,
      couple: null,
      anniversaries: [],
      schedules: [],
      budgetItems: [],
      isAuthenticated: false,
      isLoading: false,

      // 🔐 로그인 함수
      login: async (username: string, password: string) => {
        set({ isLoading: true });

        try {
          // 실제 앱에서는 서버 API 호출
          await new Promise(resolve => setTimeout(resolve, 1000)); // 로딩 시뮬레이션

          const user = mockUsers.find(u =>
            u.username === username && u.password === password
          );

          if (user) {
            // 로그인 성공
            const userData: User = {
              id: user.id,
              name: user.name,
              email: user.email,
            };

            // 해당 사용자의 커플 정보 찾기
            const couple = mockCouples.find(c =>
              c.users.some(u => u.id === user.id)
            );

            set({
              user: userData,
              couple: couple || null,
              isAuthenticated: true,
              isLoading: false
            });

            return true;
          } else {
            // 로그인 실패
            set({ isLoading: false });
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
          // 실제 앱에서는 서버 API 호출
          await new Promise(resolve => setTimeout(resolve, 1500)); // 로딩 시뮬레이션

          // 중복 아이디 체크
          const existingUser = mockUsers.find(u => u.username === data.username);
          if (existingUser) {
            set({ isLoading: false });
            return false;
          }

          // 중복 이메일 체크
          const existingEmail = mockUsers.find(u => u.email === data.email);
          if (existingEmail) {
            set({ isLoading: false });
            return false;
          }

          // 새 사용자 생성
          const newUser = {
            id: `user_${Date.now()}`,
            username: data.username,
            password: data.password,
            name: data.nickname,
            email: data.email,
          };

          // 임시 데이터베이스에 추가 (실제 앱에서는 서버에 저장)
          mockUsers.push(newUser);

          set({ isLoading: false });
          return true;

        } catch (error) {
          set({ isLoading: false });
          console.error('회원가입 오류:', error);
          return false;
        }
      },

      // 🚪 로그아웃 함수
      logout: () => {
        set({
          user: null,
          couple: null,
          anniversaries: [],
          schedules: [],
          budgetItems: [],
          isAuthenticated: false,
        });
      },

      // 기존 액션들
      setUser: (user) => set({ user }),
      setCouple: (couple) => set({ couple }),
      setAnniversaries: (anniversaries) => set({ anniversaries }),
      setSchedules: (schedules) => set({ schedules }),
      setBudgetItems: (budgetItems) => set({ budgetItems }),

      // 헬퍼 함수들
      getDaysFromStart: () => {
        const { couple } = get();
        if (!couple) return 0;

        const startDate = new Date(couple.startDate);
        const today = new Date();
        const diffTime = Math.abs(today.getTime() - startDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
      },

      getUpcomingAnniversaries: () => {
        const { anniversaries } = get();
        const today = new Date();

        return anniversaries
          .filter(ann => new Date(ann.date) >= today)
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .slice(0, 3);
      },

      getTodaySchedules: () => {
        const { schedules } = get();
        const today = new Date().toISOString().split('T')[0];

        return schedules.filter(schedule => schedule.date === today);
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
      name: 'app-storage', // 로컬 스토리지 키
      partialize: (state) => ({
        user: state.user,
        couple: state.couple,
        isAuthenticated: state.isAuthenticated,
        anniversaries: state.anniversaries,
        schedules: state.schedules,
        budgetItems: state.budgetItems,
      }), // 저장할 상태만 선택
    }
  )
);
