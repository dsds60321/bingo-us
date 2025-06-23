import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
  TextInput,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../store/themeStore';
import { useBetStore } from '../../store/betStore';
import { useAppStore } from '../../store/appStore';
import { CustomScrollView } from '../../components/CustomScrollView.tsx';

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
  },
  gameTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.primary,
    marginBottom: 20,
    textAlign: 'center',
  },
  setupCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  setupTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  optionsContainer: {
    marginBottom: 20,
  },
  optionInput: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    fontSize: 16,
    color: '#333',
  },
  addButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  optionItem: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  removeButton: {
    backgroundColor: '#F44336',
    borderRadius: 16,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 18,
    alignItems: 'center',
    marginTop: 20,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  ladderContainer: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  playersRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  playerButton: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: 16,
    padding: 12,
    minWidth: 60,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedPlayer: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  playerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  selectedPlayerText: {
    color: '#fff',
  },
  ladderArea: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 20,
    marginVertical: 20,
    position: 'relative',
  },
  ladderGrid: {
    flexDirection: 'column',
  },
  verticalLine: {
    width: 3,
    backgroundColor: colors.primary,
    position: 'absolute',
  },
  horizontalLine: {
    height: 3,
    backgroundColor: colors.accent1,
    position: 'absolute',
  },
  ladderPoint: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    position: 'absolute',
  },
  animatedBall: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.accent2,
    borderWidth: 2,
    borderColor: '#fff',
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  resultsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  resultBox: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: 12,
    padding: 12,
    minWidth: 60,
    alignItems: 'center',
    minHeight: 60,
    justifyContent: 'center',
    maxWidth: 80,
  },
  hiddenResultBox: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: 12,
    padding: 12,
    minWidth: 60,
    alignItems: 'center',
    minHeight: 60,
    justifyContent: 'center',
    maxWidth: 80,
  },
  highlightedResult: {
    backgroundColor: colors.accent1,
    borderWidth: 2,
    borderColor: colors.accent2,
  },
  resultText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  hiddenResultText: {
    fontSize: 24,
    color: '#999',
  },
  highlightedResultText: {
    color: '#fff',
    fontWeight: '700',
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
  finalResultCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    alignItems: 'center',
    borderWidth: 3,
    minWidth: 200,
  },
  winnerCard: {
    borderColor: '#4CAF50',
    backgroundColor: '#4CAF50' + '10',
  },
  finalResultText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  finalResultValue: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
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
  instructionText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  waitingContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  waitingText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 20,
  },
  hiddenLadderArea: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: 12,
    padding: 16,
    marginVertical: 20,
    minHeight: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hiddenText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

interface Props {
  navigation: any;
  route: any;
}

type GamePhase = 'setup' | 'ready' | 'playing' | 'tracing' | 'result';

interface LadderConnection {
  row: number;
  from: number;
  to: number;
}

interface AnimationStep {
  x: number;
  y: number;
  duration: number;
}

export function LadderGameScreen({ navigation, route }: Props) {
  const colors = useTheme();
  const { completeBet } = useBetStore();
  const { couple } = useAppStore();
  const { bet } = route.params;

  const [gamePhase, setGamePhase] = useState<GamePhase>('setup');
  const [options, setOptions] = useState<string[]>([]);
  const [newOption, setNewOption] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState<number | null>(null);
  const [ladderConnections, setLadderConnections] = useState<LadderConnection[]>([]);
  const [tracingPath, setTracingPath] = useState<number[]>([]);
  const [finalResult, setFinalResult] = useState<string>('');

  const animatedPosition = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  const users = couple?.users || [];
  const playerCount = Math.max(2, Math.min(users.length, options.length));
  const ladderRows = 10;
  const ladderHeight = ladderRows * 48;
  const ladderWidth = width - 120;
  const columnWidth = ladderWidth / (playerCount - 1);

  useEffect(() => {
    if (gamePhase === 'ready') {
      generateLadder();
    }
  }, [gamePhase]);

  const addOption = () => {
    if (newOption.trim() && options.length < 6) {
      setOptions([...options, newOption.trim()]);
      setNewOption('');
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    } else {
      Alert.alert('알림', '최소 2개의 선택지가 필요합니다.');
    }
  };

  const startGame = () => {
    if (options.length < 2) {
      Alert.alert('알림', '최소 2개의 선택지가 필요합니다.');
      return;
    }
    setGamePhase('ready');
  };

  const generateLadder = () => {
    const connections: LadderConnection[] = [];

    // 각 행별로 연결선 생성
    for (let row = 0; row < ladderRows; row++) {
      for (let i = 0; i < playerCount - 1; i++) {
        if (Math.random() > 0.5) {
          connections.push({
            row: row,
            from: i,
            to: i + 1,
          });
        }
      }
    }

    setLadderConnections(connections);
    setGamePhase('playing');
  };

  const selectPlayer = (playerIndex: number) => {
    if (selectedPlayer !== null) return;

    setSelectedPlayer(playerIndex);
    setGamePhase('tracing');

    traceLadderWithAnimation(playerIndex);
  };

  const traceLadderWithAnimation = (startPlayer: number) => {
    let currentPlayer = startPlayer;
    const path = [currentPlayer];
    const animationSteps: AnimationStep[] = [];

    // 시작 위치 (맨 위)
    const startX = currentPlayer * columnWidth;
    animationSteps.push({ x: startX, y: 0, duration: 0 });

    // 각 행을 순회하면서 연결선 확인
    for (let row = 0; row < ladderRows; row++) {
      const currentY = (row + 1) * 48;

      // 현재 위치에서 연결된 선이 있는지 확인
      const connectionFromCurrent = ladderConnections.find(
        conn => conn.row === row && conn.from === currentPlayer
      );
      const connectionToCurrent = ladderConnections.find(
        conn => conn.row === row && conn.to === currentPlayer
      );

      if (connectionFromCurrent) {
        // 오른쪽으로 이동
        // 1. 아래로 이동 (연결선까지)
        animationSteps.push({
          x: currentPlayer * columnWidth,
          y: currentY,
          duration: 400
        });
        // 2. 오른쪽으로 이동
        currentPlayer = connectionFromCurrent.to;
        animationSteps.push({
          x: currentPlayer * columnWidth,
          y: currentY,
          duration: 600
        });
      } else if (connectionToCurrent) {
        // 왼쪽으로 이동
        // 1. 아래로 이동 (연결선까지)
        animationSteps.push({
          x: currentPlayer * columnWidth,
          y: currentY,
          duration: 400
        });
        // 2. 왼쪽으로 이동
        currentPlayer = connectionToCurrent.from;
        animationSteps.push({
          x: currentPlayer * columnWidth,
          y: currentY,
          duration: 600
        });
      } else {
        // 직진
        animationSteps.push({
          x: currentPlayer * columnWidth,
          y: currentY,
          duration: 400
        });
      }

      path.push(currentPlayer);
    }

    setTracingPath(path);

    // 최종 결과 설정
    const result = options[currentPlayer] || options[0];
    setFinalResult(result);

    // 애니메이션 실행
    animateLadderSteps(animationSteps);
  };

  const animateLadderSteps = (steps: AnimationStep[]) => {
    // 시작 위치 설정
    animatedPosition.setValue({ x: steps[0].x, y: steps[0].y });

    // 각 단계별 애니메이션 생성
    const animations = steps.slice(1).map(step =>
      Animated.timing(animatedPosition, {
        toValue: { x: step.x, y: step.y },
        duration: step.duration,
        useNativeDriver: false,
      })
    );

    // 순차적으로 애니메이션 실행
    Animated.sequence(animations).start(() => {
      // 애니메이션 완료 후 결과 화면으로 전환
      setTimeout(() => {
        setGamePhase('result');

        // 내기 완료 처리
        const currentUser = users[0];
        completeBet(bet.id, currentUser.id, {
          gameType: 'ladder-game',
          selectedPlayer: selectedPlayer,
          result: finalResult,
          options: options,
          path: tracingPath,
        });
      }, 1000);
    });
  };

  const renderLadder = () => {
    return (
      <View style={styles.ladderArea}>
        <View style={styles.ladderGrid}>
          {/* 맨 위: 플레이어 시작점 표시 */}
          <View style={styles.playersRow}>
            {Array.from({ length: playerCount }, (_, index) => (
              <View
                key={`start-${index}`}
                style={[
                  styles.ladderPoint,
                  {
                    left: index * columnWidth - 4,
                    top: -10,
                    backgroundColor: selectedPlayer === index ? colors.accent2 : colors.primary,
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                  }
                ]}
              />
            ))}
          </View>

          {/* 세로선들 */}
          {Array.from({ length: playerCount }, (_, index) => (
            <View
              key={`vertical-${index}`}
              style={[
                styles.verticalLine,
                {
                  left: index * columnWidth - 1.5,
                  top: 0,
                  height: ladderHeight,
                }
              ]}
            />
          ))}

          {/* 가로선들 (연결선) */}
          {ladderConnections.map((connection, index) => (
            <View
              key={`horizontal-${index}`}
              style={[
                styles.horizontalLine,
                {
                  left: connection.from * columnWidth,
                  top: (connection.row + 1) * 48 - 1.5,
                  width: columnWidth,
                }
              ]}
            />
          ))}

          {/* 교차점들 */}
          {Array.from({ length: ladderRows + 1 }, (_, rowIndex) =>
            Array.from({ length: playerCount }, (_, colIndex) => (
              <View
                key={`point-${rowIndex}-${colIndex}`}
                style={[
                  styles.ladderPoint,
                  {
                    left: colIndex * columnWidth - 4,
                    top: rowIndex * 48 - 4,
                  }
                ]}
              />
            ))
          )}

          {/* 애니메이션 공 */}
          {gamePhase === 'tracing' && (
            <Animated.View
              style={[
                styles.animatedBall,
                {
                  left: animatedPosition.x.interpolate({
                    inputRange: [0, ladderWidth],
                    outputRange: [-10, ladderWidth - 10],
                  }),
                  top: animatedPosition.y.interpolate({
                    inputRange: [0, ladderHeight],
                    outputRange: [-10, ladderHeight - 10],
                  }),
                },
              ]}
            />
          )}
        </View>

        {/* 맨 밑: 결과 표시 */}
        <View style={styles.resultsRow}>
          {options.slice(0, playerCount).map((option, index) => {
            const isHighlighted = gamePhase === 'tracing' &&
              tracingPath.length > 0 &&
              tracingPath[tracingPath.length - 1] === index;

            const shouldShowResult = gamePhase === 'tracing' || gamePhase === 'result';

            return (
              <View
                key={index}
                style={[
                  shouldShowResult ? styles.resultBox : styles.hiddenResultBox,
                  isHighlighted && styles.highlightedResult
                ]}
              >
                <Text style={[
                  shouldShowResult ? styles.resultText : styles.hiddenResultText,
                  isHighlighted && styles.highlightedResultText
                ]}>
                  {shouldShowResult ? option : '?'}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
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
        <Text style={styles.title}>🪜 사다리 타기</Text>
        <View style={{ width: 40 }} />
      </View>

      <CustomScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.gameTitle}>{bet.title}</Text>

        {gamePhase === 'setup' && (
          <View style={styles.setupCard}>
            <Text style={styles.setupTitle}>📝 선택지 설정</Text>

            <View style={styles.optionsContainer}>
              {options.map((option, index) => (
                <View key={index} style={styles.optionItem}>
                  <Text style={styles.optionText}>{option}</Text>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeOption(index)}
                  >
                    <Icon name="close" size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            {options.length < 6 && (
              <>
                <TextInput
                  style={styles.optionInput}
                  placeholder="새 선택지 입력..."
                  placeholderTextColor="#999"
                  value={newOption}
                  onChangeText={setNewOption}
                  onSubmitEditing={addOption}
                />
                <TouchableOpacity style={styles.addButton} onPress={addOption}>
                  <Text style={styles.addButtonText}>선택지 추가</Text>
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity style={styles.startButton} onPress={startGame}>
              <Text style={styles.startButtonText}>사다리 생성</Text>
            </TouchableOpacity>
          </View>
        )}

        {gamePhase === 'ready' && (
          <View style={styles.waitingContainer}>
            <Text style={styles.waitingText}>🎲 사다리를 생성하고 있습니다...</Text>
            <View style={styles.hiddenLadderArea}>
              <Text style={styles.hiddenText}>
                🤫 사다리가 준비되면{'\n'}플레이어를 선택할 수 있습니다!
              </Text>
            </View>
          </View>
        )}

        {(gamePhase === 'playing' || gamePhase === 'tracing') && (
          <View style={styles.ladderContainer}>
            <Text style={styles.setupTitle}>
              {gamePhase === 'playing' ? '플레이어를 선택하세요' : '사다리를 타고 있습니다...'}
            </Text>

            {gamePhase === 'playing' && (
              <Text style={styles.instructionText}>
                아래 플레이어 중 하나를 선택하여 사다리를 타보세요!
              </Text>
            )}

            {/* 플레이어 선택 */}
            <View style={styles.playersRow}>
              {Array.from({ length: playerCount }, (_, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.playerButton,
                    selectedPlayer === index && styles.selectedPlayer
                  ]}
                  onPress={() => selectPlayer(index)}
                  disabled={selectedPlayer !== null}
                >
                  <Text style={[
                    styles.playerText,
                    selectedPlayer === index && styles.selectedPlayerText
                  ]}>
                    {index < users.length ? users[index].name.slice(0, 3) : `P${index + 1}`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* 사다리 */}
            {renderLadder()}
          </View>
        )}

        {gamePhase === 'result' && (
          <View style={styles.resultContainer}>
            <Text style={[styles.resultTitle, { color: colors.primary }]}>
              결과 발표! 🎉
            </Text>

            <View style={[styles.finalResultCard, styles.winnerCard]}>
              <Text style={styles.finalResultText}>선택된 결과</Text>
              <Text style={styles.finalResultValue}>{finalResult}</Text>
            </View>

            <TouchableOpacity style={styles.actionButton} onPress={goBack}>
              <Text style={styles.actionButtonText}>결과 확인</Text>
            </TouchableOpacity>
          </View>
        )}
      </CustomScrollView>
    </SafeAreaView>
  );
}
