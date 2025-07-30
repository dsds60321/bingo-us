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
  budgetItems: [],
  // 🎯 상태 업데이트 함수
  setBudgetItems: (items) => {
    set({ budgetItems: items });
  },

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
    if (!budgetItems) {
      // ✅ 빈 상태 처리: 기본값 반환
      return {
        totalSpent: 0,
        byUser: {},
        byCategory: {},
        monthlyData: [],
      };
    }

    const monthItems = budgetItems.filter((item) =>
      item.expenseDate.startsWith(targetMonth)
    );


    const totalSpent = monthItems.reduce((sum, item) => sum + item.amount, 0);

    const byUser: { [userId: string]: number } = {};
    const byCategory: { [category: string]: number } = {};

    monthItems.forEach((item) => {
      // 실제 지불한 금액 계산
      byUser[item.paidBy] = (byUser[item.paidBy] || 0) + item.amount;

      // 카테고리별 계산
      byCategory[item.category] = (byCategory[item.category] || 0) + item.amount;
    });

    return {
      totalSpent,
      byUser,
      byCategory,
      monthlyData: [],
    };
  },

  getUserExpenses: (userId: string, month?: string) => {
    const { budgetItems } = get();
    const targetMonth = month || new Date().toISOString().slice(0, 7);

    return budgetItems
      .filter((item) => item.expenseDate.startsWith(targetMonth) && item.paidBy === userId)
      .reduce((sum, item) => sum + item.amount, 0);
  },

  getCategoryExpenses: (category: string, month?: string) => {
    const { budgetItems } = get();
    const targetMonth = month || new Date().toISOString().slice(0, 7);

    return budgetItems
      .filter((item) => item.expenseDate.startsWith(targetMonth) && item.category === category)
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
