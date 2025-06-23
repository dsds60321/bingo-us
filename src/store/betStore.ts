import { create } from 'zustand';
import { Bet, BetHistory } from '../types';

interface BetStore {
  bets: Bet[];
  betHistory: BetHistory[];
  currentBet: Bet | null;

  // Actions
  addBet: (bet: Omit<Bet, 'id' | 'createdAt'>) => void;
  updateBet: (id: string, bet: Partial<Bet>) => void;
  completeBet: (id: string, winner: string, gameData?: any) => void;
  setCurrentBet: (bet: Bet | null) => void;
  getBetsByUser: (userId: string) => Bet[];
  getWinRate: (userId: string) => number;
}

export const useBetStore = create<BetStore>((set, get) => ({
  bets: [
    // 예시 데이터
    {
      id: '1',
      title: '저녁 메뉴 결정',
      description: '오늘 저녁은 치킨 vs 피자',
      stake: '진 사람이 저녁값 내기',
      gameType: 'rock-paper-scissors',
      status: 'completed',
      winner: 'user2',
      participants: ['user1', 'user2'],
      createdBy: 'user1',
      createdAt: '2025-06-20T15:30:00Z',
      completedAt: '2025-06-20T15:35:00Z',
    },
    {
      id: '2',
      title: '설거지 담당자',
      description: '일주일 설거지 담당 정하기',
      stake: '진 사람이 일주일 설거지',
      gameType: 'button-tap',
      status: 'pending',
      participants: ['user1', 'user2'],
      createdBy: 'user2',
      createdAt: '2025-06-21T10:00:00Z',
    }
  ],
  betHistory: [],
  currentBet: null,

  addBet: (bet) => {
    const newBet: Bet = {
      ...bet,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      bets: [...state.bets, newBet],
    }));
  },

  updateBet: (id, updatedBet) => {
    set((state) => ({
      bets: state.bets.map(bet =>
        bet.id === id ? { ...bet, ...updatedBet } : bet
      ),
    }));
  },

  completeBet: (id, winner, gameData) => {
    const { bets } = get();
    const bet = bets.find(b => b.id === id);

    if (bet) {
      // 내기 완료 처리
      set((state) => ({
        bets: state.bets.map(b =>
          b.id === id
            ? {
              ...b,
              status: 'completed' as const,
              winner,
              completedAt: new Date().toISOString(),
              gameData
            }
            : b
        ),
        betHistory: [...state.betHistory, {
          betId: id,
          gameData,
          result: { winner },
          timestamp: new Date().toISOString(),
        }],
      }));
    }
  },

  setCurrentBet: (bet) => {
    set({ currentBet: bet });
  },

  getBetsByUser: (userId) => {
    const { bets } = get();
    return bets.filter(bet => bet.participants.includes(userId));
  },

  getWinRate: (userId) => {
    const { bets } = get();
    const userBets = bets.filter(bet =>
      bet.participants.includes(userId) && bet.status === 'completed'
    );

    if (userBets.length === 0) return 0;

    const wins = userBets.filter(bet => bet.winner === userId).length;
    return (wins / userBets.length) * 100;
  },
}));
