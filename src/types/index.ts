export interface User {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
}

export interface Couple {
  id: string;
  users: User[];
  startDate: string; // YYYY-MM-DD
  createdAt: string;
}

export interface Anniversary {
  id: string;
  type: 'ANNIVERSARY' | 'BIRTHDAY' | 'CUSTOM';
  title: string;
  date: string; // YYYY-MM-DD
  isContinue: number; // 0 또는 1 (매년 반복)
  isPrivate: number; // 0 또는 1 (비공개)
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Schedule {
  id: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  location?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  assignedTo?: string;
  category?: string;
  estimatedDuration?: number; // 분 단위
  tags?: string[];
  completedAt?: string;
  completedBy?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}


export interface BudgetItem {
  id: string;
  title: string;
  amount: number;
  paidBy: string; // User ID
  category: 'food' | 'entertainment' | 'transport' | 'shopping' | 'travel' | 'health' | 'other';
  expenseDate: string; // YYYY-MM-DD
  location?: string;
  description?: string;
  coupleId: string;
  receipt?: string; // 영수증 이미지 URL
}

export interface Settings {
  showBudgetOnDashboard: boolean;
  budgetNotifications: boolean;
  monthlyBudgetLimit?: number;
  defaultSplitRatio: 'equal' | 'custom';
  theme: 'light' | 'dark';
}

export interface BudgetStats {
  totalSpent: number;
  byUser: { [userId: string]: number };
  byCategory: { [category: string]: number };
  monthlyData: { month: string; amount: number }[];
}

// 🎮 내기 관련 타입
export interface Bet {
  id: string;
  title: string;
  description?: string;
  stake: string; // 내기 내용
  gameType: 'rock-paper-scissors' | 'button-tap' | 'ladder-game';
  status: 'pending' | 'in-progress' | 'completed';
  winner?: string; // User ID
  participants: string[]; // User IDs
  createdBy: string; // User ID
  createdAt: string;
  completedAt?: string;
  gameData?: any; // 게임별 추가 데이터
  gameSettings?: GameSettings; // 게임 설정
}

export interface BetHistory {
  betId: string;
  gameData: any;
  result: {
    winner: string;
    scores?: { [userId: string]: number };
  };
  timestamp: string;
}

// 🎮 게임 관련 타입
export interface GameSettings {
  buttonTap?: {
    duration: number; // 초 단위
  };
  ladderGame?: {
    ladderCount: number; // 사다리 개수
    resultOptions: string[]; // 결과 옵션들
  };
}

export type RockPaperScissorsChoice = 'rock' | 'paper' | 'scissors';

export interface RockPaperScissorsGameData {
  gameId: string;
  players: {
    [userId: string]: {
      choice?: RockPaperScissorsChoice;
      ready: boolean;
    };
  };
  result?: {
    winner?: string;
    choices: { [userId: string]: RockPaperScissorsChoice };
  };
  status: 'waiting' | 'playing' | 'finished';
}

export interface ButtonTapGameData {
  duration: number;
  scores: { [userId: string]: number };
  isActive: boolean;
  startTime?: number;
  endTime?: number;
}

export interface LadderGameData {
  ladders: LadderPath[];
  results: string[];
  playerChoices: { [userId: string]: number };
  finalResults: { [userId: string]: string };
}

export interface LadderPath {
  id: number;
  connections: number[]; // 연결된 사다리 인덱스들
}
