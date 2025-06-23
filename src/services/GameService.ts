import axios from 'axios';
import { RockPaperScissorsChoice, RockPaperScissorsGameData } from '../types';

const BASE_URL = 'https://your-api-server.com/api'; // 실제 서버 URL로 변경

class GameService {
  // 🎮 가위바위보 게임 관련
  async createRockPaperScissorsGame(betId: string, participants: string[]): Promise<RockPaperScissorsGameData> {
    try {
      const response = await axios.post(`${BASE_URL}/games/rock-paper-scissors`, {
        betId,
        participants,
      });
      return response.data;
    } catch (error) {
      console.error('가위바위보 게임 생성 실패:', error);
      // 서버 연결 실패 시 목업 데이터 반환
      return this.createMockRockPaperScissorsGame(betId, participants);
    }
  }

  async submitRockPaperScissorsChoice(
    gameId: string,
    userId: string,
    choice: RockPaperScissorsChoice
  ): Promise<RockPaperScissorsGameData> {
    try {
      const response = await axios.post(`${BASE_URL}/games/rock-paper-scissors/${gameId}/choice`, {
        userId,
        choice,
      });
      return response.data;
    } catch (error) {
      console.error('가위바위보 선택 제출 실패:', error);
      // 서버 연결 실패 시 목업 결과 반환
      return this.processMockRockPaperScissorsChoice(gameId, userId, choice);
    }
  }

  async getRockPaperScissorsGameStatus(gameId: string): Promise<RockPaperScissorsGameData> {
    try {
      const response = await axios.get(`${BASE_URL}/games/rock-paper-scissors/${gameId}`);
      return response.data;
    } catch (error) {
      console.error('가위바위보 게임 상태 조회 실패:', error);
      throw error;
    }
  }

  // 🎮 목업 데이터 (서버 없을 때 테스트용)
  private createMockRockPaperScissorsGame(betId: string, participants: string[]): RockPaperScissorsGameData {
    return {
      gameId: `mock_${betId}_${Date.now()}`,
      players: participants.reduce((acc, userId) => {
        acc[userId] = { ready: false };
        return acc;
      }, {} as any),
      status: 'waiting',
    };
  }

  private processMockRockPaperScissorsChoice(
    gameId: string,
    userId: string,
    choice: RockPaperScissorsChoice
  ): RockPaperScissorsGameData {
    // 컴퓨터(상대방) 선택 생성
    const choices: RockPaperScissorsChoice[] = ['rock', 'paper', 'scissors'];
    const computerChoice = choices[Math.floor(Math.random() * choices.length)];
    const computerUserId = 'computer'; // 임시 상대방 ID

    const playerChoices = {
      [userId]: choice,
      [computerUserId]: computerChoice,
    };

    // 승부 결정
    let winner: string | undefined;
    if (choice === computerChoice) {
      // 무승부 - winner는 undefined
    } else if (
      (choice === 'rock' && computerChoice === 'scissors') ||
      (choice === 'paper' && computerChoice === 'rock') ||
      (choice === 'scissors' && computerChoice === 'paper')
    ) {
      winner = userId;
    } else {
      winner = computerUserId;
    }

    return {
      gameId,
      players: {
        [userId]: { choice, ready: true },
        [computerUserId]: { choice: computerChoice, ready: true },
      },
      result: {
        winner,
        choices: playerChoices,
      },
      status: 'finished',
    };
  }
}

export const gameService = new GameService();
