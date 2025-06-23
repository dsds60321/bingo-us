import { create } from 'zustand';
import { BudgetItem, BudgetStats } from '../types';

interface BudgetStore {
  budgetItems: BudgetItem[];
  currentMonthStats: BudgetStats;
  showBudgetOnDashboard: boolean;

  // Actions
  addBudgetItem: (item: Omit<BudgetItem, 'id'>) => void;
  deleteBudgetItem: (id: string) => void;
  updateBudgetItem: (id: string, item: Partial<BudgetItem>) => void;
  setBudgetDashboardVisibility: (visible: boolean) => void;
  calculateStats: (month?: string) => BudgetStats;
  getUserExpenses: (userId: string, month?: string) => number;
  getCategoryExpenses: (category: string, month?: string) => number;
  getMonthlyData: (months: number) => { month: string; amount: number }[];
}

export const useBudgetStore = create<BudgetStore>((set, get) => ({
  budgetItems: [
    // 예시 데이터
    {
      id: '1',
      title: '저녁 식사',
      amount: 85000,
      paidBy: 'user1',
      category: 'food',
      date: '2025-06-20',
      location: '강남역 맛집',
      description: '첫 데이트 저녁식사',
      coupleId: 'couple1',
      splitRatio: { user1: 0.6, user2: 0.4 }
    },
    {
      id: '2',
      title: '영화 관람',
      amount: 32000,
      paidBy: 'user2',
      category: 'entertainment',
      date: '2025-06-19',
      location: 'CGV 강남',
      description: '어벤져스 관람',
      coupleId: 'couple1',
      splitRatio: { user1: 0.5, user2: 0.5 }
    },
    {
      id: '3',
      title: '카페',
      amount: 18000,
      paidBy: 'user1',
      category: 'food',
      date: '2025-06-18',
      location: '스타벅스',
      coupleId: 'couple1',
      splitRatio: { user1: 0.5, user2: 0.5 }
    },
    {
      id: '4',
      title: '쇼핑',
      amount: 120000,
      paidBy: 'user2',
      category: 'shopping',
      date: '2025-06-15',
      location: '롯데백화점',
      description: '커플 옷 쇼핑',
      coupleId: 'couple1',
      splitRatio: { user1: 0.5, user2: 0.5 }
    }
  ],
  currentMonthStats: {
    totalSpent: 0,
    byUser: {},
    byCategory: {},
    monthlyData: []
  },
  showBudgetOnDashboard: true,

  addBudgetItem: (item) => {
    const newItem: BudgetItem = {
      ...item,
      id: Date.now().toString(),
    };

    set((state) => ({
      budgetItems: [...state.budgetItems, newItem],
    }));
  },

  deleteBudgetItem: (id) => {
    set((state) => ({
      budgetItems: state.budgetItems.filter(item => item.id !== id),
    }));
  },

  updateBudgetItem: (id, updatedItem) => {
    set((state) => ({
      budgetItems: state.budgetItems.map(item =>
        item.id === id ? { ...item, ...updatedItem } : item
      ),
    }));
  },

  setBudgetDashboardVisibility: (visible) => {
    set({ showBudgetOnDashboard: visible });
  },

  calculateStats: (month) => {
    const { budgetItems } = get();
    const targetMonth = month || new Date().toISOString().slice(0, 7); // YYYY-MM

    const monthItems = budgetItems.filter(item =>
      item.date.startsWith(targetMonth)
    );

    const totalSpent = monthItems.reduce((sum, item) => sum + item.amount, 0);

    const byUser: { [userId: string]: number } = {};
    const byCategory: { [category: string]: number } = {};

    monthItems.forEach(item => {
      // 실제 지불한 금액 계산
      byUser[item.paidBy] = (byUser[item.paidBy] || 0) + item.amount;

      // 카테고리별 계산
      byCategory[item.category] = (byCategory[item.category] || 0) + item.amount;
    });

    return {
      totalSpent,
      byUser,
      byCategory,
      monthlyData: []
    };
  },

  getUserExpenses: (userId, month) => {
    const { budgetItems } = get();
    const targetMonth = month || new Date().toISOString().slice(0, 7);

    return budgetItems
      .filter(item => item.date.startsWith(targetMonth) && item.paidBy === userId)
      .reduce((sum, item) => sum + item.amount, 0);
  },

  getCategoryExpenses: (category, month) => {
    const { budgetItems } = get();
    const targetMonth = month || new Date().toISOString().slice(0, 7);

    return budgetItems
      .filter(item => item.date.startsWith(targetMonth) && item.category === category)
      .reduce((sum, item) => sum + item.amount, 0);
  },

  getMonthlyData: (months = 6) => {
    const { budgetItems } = get();
    const monthlyData: { month: string; amount: number }[] = [];

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = date.toISOString().slice(0, 7);

      const monthTotal = budgetItems
        .filter(item => item.date.startsWith(monthKey))
        .reduce((sum, item) => sum + item.amount, 0);

      monthlyData.push({
        month: date.toLocaleDateString('ko-KR', { month: 'short' }),
        amount: monthTotal
      });
    }

    return monthlyData;
  },
}));
