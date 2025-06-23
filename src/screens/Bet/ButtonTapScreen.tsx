import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Animated,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../store/themeStore';
import { useBetStore } from '../../store/betStore';
import { useAppStore } from '../../store/appStore';

const { width } = Dimensions.get('window');

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
  settingsCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    width: '100%',
    maxWidth: 300,
  },
  settingsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  durationButton: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: 12,
    padding: 12,
    minWidth: 50,
    alignItems: 'center',
  },
  selectedDuration: {
    backgroundColor: colors.primary,
  },
  durationText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  selectedDurationText: {
    color: '#fff',
  },
  countdownContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  countdownText: {
    fontSize: 72,
    fontWeight: '900',
    color: colors.primary,
  },
  countdownLabel: {
    fontSize: 18,
    color: '#666',
    marginTop: 8,
  },
  gameArea: {
    alignItems: 'center',
    width: '100%',
  },
  gameButton: {
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: width * 0.35,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
    marginBottom: 32,
  },
  gameButtonPressed: {
    backgroundColor: colors.accent1,
    transform: [{ scale: 0.95 }],
  },
  gameButtonText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
  },
  scoreContainer: {
    flexDirection: 'row',
    gap: 40,
    marginBottom: 32,
  },
  scoreCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    minWidth: 100,
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.primary,
  },
  timerText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.accent1,
    marginBottom: 16,
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
  finalScores: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 300,
    marginBottom: 24,
  },
  finalScoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '600',
  },
  playerScore: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  winnerRow: {
    backgroundColor: '#4CAF50' + '20',
    borderRadius: 8,
    padding: 8,
    marginHorizontal: -8,
  },
  winnerName: {
    color: '#4CAF50',
  },
  actionButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 20,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  startButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 40,
    paddingVertical: 20,
    borderRadius: 20,
    marginTop: 20,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});

interface Props {
  navigation: any;
  route: any;
}

type GamePhase = 'setup' | 'countdown' | 'playing' | 'result';

export function ButtonTapScreen({ navigation, route }: Props) {
  const colors = useTheme();
  const { completeBet } = useBetStore();
  const { couple } = useAppStore();
  const { bet } = route.params;

  const [gamePhase, setGamePhase] = useState<GamePhase>('setup');
  const [duration, setDuration] = useState(bet.gameSettings?.buttonTap?.duration || 10);
  const [countdown, setCountdown] = useState(3);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [playerScore, setPlayerScore] = useState(0);
  const [computerScore, setComputerScore] = useState(0);
  const [isPressed, setIsPressed] = useState(false);

  const users = couple?.users || [];
  const currentUser = users[0];

  const gameTimer = useRef<NodeJS.Timeout>();
  const countdownTimer = useRef<NodeJS.Timeout>();
  const computerTimer = useRef<NodeJS.Timeout>();
  const buttonScale = useRef(new Animated.Value(1)).current;

  const durationOptions = [5, 10, 15, 20, 30];

  useEffect(() => {
    return () => {
      if (gameTimer.current) clearInterval(gameTimer.current);
      if (countdownTimer.current) clearInterval(countdownTimer.current);
      if (computerTimer.current) clearInterval(computerTimer.current);
    };
  }, []);

  const startCountdown = () => {
    setGamePhase('countdown');
    setCountdown(3);

    countdownTimer.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownTimer.current);
          startGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const startGame = () => {
    setGamePhase('playing');
    setTimeLeft(duration);
    setPlayerScore(0);
    setComputerScore(0);

    // 게임 타이머 시작
    gameTimer.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(gameTimer.current);
          clearInterval(computerTimer.current);
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // 컴퓨터 자동 클릭 (랜덤한 간격으로)
    const computerAutoClick = () => {
      if (gameTimer.current) {
        setComputerScore(prev => prev + 1);
        const nextDelay = Math.random() * 800 + 200; // 200ms ~ 1000ms
        computerTimer.current = setTimeout(computerAutoClick, nextDelay);
      }
    };
    computerTimer.current = setTimeout(computerAutoClick, Math.random() * 500 + 500);
  };

  const handleButtonPress = () => {
    if (gamePhase !== 'playing') return;

    setPlayerScore(prev => prev + 1);
    setIsPressed(true);

    // 버튼 애니메이션
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start(() => setIsPressed(false));
  };

  const endGame = () => {
    setGamePhase('result');

    // 승자 결정
    const winner = playerScore > computerScore ? currentUser.id :
      computerScore > playerScore ? 'computer' : null;

    // 내기 완료 처리
    completeBet(bet.id, winner || currentUser.id, {
      gameType: 'button-tap',
      duration,
      playerScore,
      computerScore,
      winner: winner || 'draw',
    });
  };

  const getResultText = () => {
    if (playerScore > computerScore) return '승리! 🎉';
    if (computerScore > playerScore) return '패배 😢';
    return '무승부! 🤝';
  };

  const getResultColor = () => {
    if (playerScore > computerScore) return '#4CAF50';
    if (computerScore > playerScore) return '#F44336';
    return colors.primary;
  };

  const goBack = () => {
    navigation.goBack();
  };

  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <Icon name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>👆 버튼 누르기</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.gameTitle}>{bet.title}</Text>

        {gamePhase === 'setup' && (
          <>
            <View style={styles.settingsCard}>
              <Text style={styles.settingsTitle}>⏰ 게임 시간 설정</Text>
              <View style={styles.durationContainer}>
                {durationOptions.map(option => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.durationButton,
                      duration === option && styles.selectedDuration
                    ]}
                    onPress={() => setDuration(option)}
                  >
                    <Text style={[
                      styles.durationText,
                      duration === option && styles.selectedDurationText
                    ]}>
                      {option}초
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity style={styles.startButton} onPress={startCountdown}>
              <Text style={styles.startButtonText}>게임 시작</Text>
            </TouchableOpacity>
          </>
        )}

        {gamePhase === 'countdown' && (
          <View style={styles.countdownContainer}>
            <Text style={styles.countdownText}>
              {countdown > 0 ? countdown : 'GO!'}
            </Text>
            <Text style={styles.countdownLabel}>준비하세요!</Text>
          </View>
        )}

        {gamePhase === 'playing' && (
          <View style={styles.gameArea}>
            <Text style={styles.timerText}>⏰ {timeLeft}초</Text>

            <View style={styles.scoreContainer}>
              <View style={styles.scoreCard}>
                <Text style={styles.scoreLabel}>나</Text>
                <Text style={styles.scoreValue}>{playerScore}</Text>
              </View>
              <View style={styles.scoreCard}>
                <Text style={styles.scoreLabel}>상대</Text>
                <Text style={styles.scoreValue}>{computerScore}</Text>
              </View>
            </View>

            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
              <TouchableOpacity
                style={[styles.gameButton, isPressed && styles.gameButtonPressed]}
                onPress={handleButtonPress}
                activeOpacity={0.8}
              >
                <Text style={styles.gameButtonText}>TAP!</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        )}

        {gamePhase === 'result' && (
          <View style={styles.resultContainer}>
            <Text style={[styles.resultTitle, { color: getResultColor() }]}>
              {getResultText()}
            </Text>

            <View style={styles.finalScores}>
              <View style={[
                styles.finalScoreRow,
                playerScore > computerScore && styles.winnerRow
              ]}>
                <Text style={[
                  styles.playerName,
                  playerScore > computerScore && styles.winnerName
                ]}>
                  {currentUser.name}
                </Text>
                <Text style={styles.playerScore}>{playerScore}점</Text>
              </View>

              <View style={[
                styles.finalScoreRow,
                computerScore > playerScore && styles.winnerRow,
                { marginBottom: 0 }
              ]}>
                <Text style={[
                  styles.playerName,
                  computerScore > playerScore && styles.winnerName
                ]}>
                  상대방
                </Text>
                <Text style={styles.playerScore}>{computerScore}점</Text>
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
