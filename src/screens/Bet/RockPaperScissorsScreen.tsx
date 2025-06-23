import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../store/themeStore';
import { useBetStore } from '../../store/betStore';
import { useAppStore } from '../../store/appStore';
import { gameService } from '../../services/gameService';
import { RockPaperScissorsChoice, RockPaperScissorsGameData } from '../../types';

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.surface,
  },
  backButton: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: 20,
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.primary,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gameTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.primary,
    marginBottom: 20,
    textAlign: 'center',
  },
  statusText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 40,
    textAlign: 'center',
  },
  choiceGrid: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 40,
  },
  choiceButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  selectedChoice: {
    backgroundColor: colors.primary,
    transform: [{ scale: 1.1 }],
  },
  choiceEmoji: {
    fontSize: 40,
  },
  choiceLabel: {
    fontSize: 12,
    marginTop: 4,
    color: '#666',
    fontWeight: '600',
  },
  waitingContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  waitingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  resultContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
  },
  vsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 40,
    marginBottom: 30,
  },
  playerResult: {
    alignItems: 'center',
  },
  playerLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  playerChoice: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
  },
  winnerChoice: {
    borderColor: '#4CAF50',
    backgroundColor: '#4CAF50' + '20',
  },
  loserChoice: {
    borderColor: '#F44336',
    backgroundColor: '#F44336' + '20',
  },
  drawChoice: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '20',
  },
  vsText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#666',
  },
  actionButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 20,
    marginTop: 20,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

interface Props {
  navigation: any;
  route: any;
}

export function RockPaperScissorsScreen({ navigation, route }: Props) {
  const colors = useTheme();
  const { completeBet } = useBetStore();
  const { couple } = useAppStore();
  const { bet } = route.params;

  const [gameData, setGameData] = useState<RockPaperScissorsGameData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedChoice, setSelectedChoice] = useState<RockPaperScissorsChoice | null>(null);
  const [gamePhase, setGamePhase] = useState<'loading' | 'choosing' | 'waiting' | 'result'>('loading');

  const users = couple?.users || [];
  const currentUser = users[0]; // 현재 사용자

  const choices: { type: RockPaperScissorsChoice; emoji: string; label: string }[] = [
    { type: 'rock', emoji: '✊', label: '바위' },
    { type: 'paper', emoji: '✋', label: '보' },
    { type: 'scissors', emoji: '✌️', label: '가위' },
  ];

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = async () => {
    try {
      setLoading(true);
      const gameData = await gameService.createRockPaperScissorsGame(
        bet.id,
        bet.participants
      );
      setGameData(gameData);
      setGamePhase('choosing');
    } catch (error) {
      Alert.alert('오류', '게임을 시작할 수 없습니다.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleChoice = async (choice: RockPaperScissorsChoice) => {
    if (!gameData || selectedChoice) return;

    try {
      setSelectedChoice(choice);
      setGamePhase('waiting');

      const updatedGameData = await gameService.submitRockPaperScissorsChoice(
        gameData.gameId,
        currentUser.id,
        choice
      );

      setGameData(updatedGameData);

      if (updatedGameData.status === 'finished') {
        setGamePhase('result');

        // 내기 완료 처리
        if (updatedGameData.result?.winner) {
          completeBet(bet.id, updatedGameData.result.winner, {
            gameType: 'rock-paper-scissors',
            playerChoice: choice,
            result: updatedGameData.result,
          });
        }
      }
    } catch (error) {
      Alert.alert('오류', '선택을 전송할 수 없습니다.');
      setSelectedChoice(null);
      setGamePhase('choosing');
    }
  };

  const getChoiceEmoji = (choice: RockPaperScissorsChoice) => {
    return choices.find(c => c.type === choice)?.emoji || '?';
  };

  const getResultColor = (isWinner: boolean, isDraw: boolean) => {
    if (isDraw) return colors.primary;
    return isWinner ? '#4CAF50' : '#F44336';
  };

  const getResultText = () => {
    if (!gameData?.result) return '';

    const { winner } = gameData.result;
    if (!winner) return '무승부! 🤝';

    return winner === currentUser.id ? '승리! 🎉' : '패배 😢';
  };

  const goBack = () => {
    navigation.goBack();
  };

  const styles = createStyles(colors);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={goBack}>
            <Icon name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>✊✋✌️ 가위바위보</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={[styles.content, { justifyContent: 'center' }]}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.waitingText}>게임을 준비 중입니다...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <Icon name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>✊✋✌️ 가위바위보</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.gameTitle}>{bet.title}</Text>

        {gamePhase === 'choosing' && (
          <>
            <Text style={styles.statusText}>가위, 바위, 보 중 하나를 선택하세요!</Text>
            <View style={styles.choiceGrid}>
              {choices.map(choice => (
                <TouchableOpacity
                  key={choice.type}
                  style={[
                    styles.choiceButton,
                    selectedChoice === choice.type && styles.selectedChoice
                  ]}
                  onPress={() => handleChoice(choice.type)}
                >
                  <Text style={styles.choiceEmoji}>{choice.emoji}</Text>
                  <Text style={styles.choiceLabel}>{choice.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {gamePhase === 'waiting' && (
          <View style={styles.waitingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.waitingText}>
              상대방의 선택을 기다리는 중...
              {selectedChoice && `\n내 선택: ${getChoiceEmoji(selectedChoice)}`}
            </Text>
          </View>
        )}

        {gamePhase === 'result' && gameData?.result && (
          <View style={styles.resultContainer}>
            <Text style={[
              styles.resultTitle,
              { color: getResultColor(
                  gameData.result.winner === currentUser.id,
                  !gameData.result.winner
                )}
            ]}>
              {getResultText()}
            </Text>

            <View style={styles.vsContainer}>
              <View style={styles.playerResult}>
                <Text style={styles.playerLabel}>나</Text>
                <View style={[
                  styles.playerChoice,
                  gameData.result.winner === currentUser.id ? styles.winnerChoice :
                    !gameData.result.winner ? styles.drawChoice : styles.loserChoice
                ]}>
                  <Text style={styles.choiceEmoji}>
                    {getChoiceEmoji(gameData.result.choices[currentUser.id])}
                  </Text>
                </View>
              </View>

              <Text style={styles.vsText}>VS</Text>

              <View style={styles.playerResult}>
                <Text style={styles.playerLabel}>상대</Text>
                <View style={[
                  styles.playerChoice,
                  gameData.result.winner && gameData.result.winner !== currentUser.id ? styles.winnerChoice :
                    !gameData.result.winner ? styles.drawChoice : styles.loserChoice
                ]}>
                  <Text style={styles.choiceEmoji}>
                    {Object.entries(gameData.result.choices)
                      .filter(([userId]) => userId !== currentUser.id)
                      .map(([_, choice]) => getChoiceEmoji(choice))[0] || '?'}
                  </Text>
                </View>
              </View>
            </View>

            <TouchableOpacity style={styles.actionButton} onPress={goBack}>
              <Text style={styles.actionButtonText}>결과 확인</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
