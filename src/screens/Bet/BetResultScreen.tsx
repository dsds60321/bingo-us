import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../store/themeStore';
import { useAppStore } from '../../store/appStore';
import { CustomScrollView } from '../../components/CustomScrollView.tsx';

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
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
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
    padding: 20,
  },
  resultCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  resultIcon: {
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 8,
    textAlign: 'center',
  },
  resultSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  winnerCard: {
    backgroundColor: '#4CAF50' + '15',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  winnerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  winnerName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4CAF50',
    marginBottom: 4,
  },
  winnerLabel: {
    fontSize: 14,
    color: '#666',
  },
  betInfoCard: {
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
  betTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 8,
  },
  betStake: {
    fontSize: 16,
    color: '#333',
    marginBottom: 12,
  },
  gameInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  gameText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  gameDataCard: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  gameDataTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 12,
  },
  gameDataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  gameDataLabel: {
    fontSize: 14,
    color: '#666',
  },
  gameDataValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  metaInfo: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  metaLabel: {
    fontSize: 14,
    color: '#666',
  },
  metaValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  backToListButton: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  backToListText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

interface Props {
  navigation: any;
  route: any;
}

export function BetResultScreen({ navigation, route }: Props) {
  const colors = useTheme();
  const { couple } = useAppStore();
  const { bet } = route.params;

  const users = couple?.users || [];
  const winner = users.find(user => user.id === bet.winner);

  const getGameIcon = (gameType: string) => {
    switch (gameType) {
      case 'rock-paper-scissors':
        return 'back-hand';
      case 'button-tap':
        return 'touch-app';
      case 'ladder-game':
        return 'linear-scale';
      default:
        return 'games';
    }
  };

  const getGameLabel = (gameType: string) => {
    switch (gameType) {
      case 'rock-paper-scissors':
        return '가위바위보';
      case 'button-tap':
        return '버튼 누르기';
      case 'ladder-game':
        return '사다리 타기';
      default:
        return '게임';
    }
  };

  const renderGameData = () => {
    if (!bet.gameData) return null;

    switch (bet.gameType) {
      case 'rock-paper-scissors':
        return (
          <View style={styles.gameDataCard}>
            <Text style={styles.gameDataTitle}>🎮 게임 결과</Text>
            <View style={styles.gameDataRow}>
              <Text style={styles.gameDataLabel}>플레이어 선택</Text>
              <Text style={styles.gameDataValue}>
                {bet.gameData.playerChoice === 'rock' ? '✊ 바위' :
                  bet.gameData.playerChoice === 'paper' ? '✋ 보' : '✌️ 가위'}
              </Text>
            </View>
            <View style={styles.gameDataRow}>
              <Text style={styles.gameDataLabel}>상대방 선택</Text>
              <Text style={styles.gameDataValue}>
                {bet.gameData.computerChoice === 'rock' ? '✊ 바위' :
                  bet.gameData.computerChoice === 'paper' ? '✋ 보' : '✌️ 가위'}
              </Text>
            </View>
            <View style={[styles.gameDataRow, { marginBottom: 0 }]}>
              <Text style={styles.gameDataLabel}>결과</Text>
              <Text style={styles.gameDataValue}>
                {bet.gameData.result === 'win' ? '🎉 승리' :
                  bet.gameData.result === 'lose' ? '😢 패배' : '🤝 무승부'}
              </Text>
            </View>
          </View>
        );

      case 'button-tap':
        return (
          <View style={styles.gameDataCard}>
            <Text style={styles.gameDataTitle}>🎮 게임 결과</Text>
            <View style={styles.gameDataRow}>
              <Text style={styles.gameDataLabel}>플레이어 점수</Text>
              <Text style={styles.gameDataValue}>{bet.gameData.playerScore || 0}점</Text>
            </View>
            <View style={[styles.gameDataRow, { marginBottom: 0 }]}>
              <Text style={styles.gameDataLabel}>상대방 점수</Text>
              <Text style={styles.gameDataValue}>{bet.gameData.computerScore || 0}점</Text>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.container}>
      <CustomScrollView showsVerticalScrollIndicator={false}>
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>내기 결과</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.content}>
          {/* 결과 카드 */}
          <View style={styles.resultCard}>
            <View style={styles.resultIcon}>
              <Icon name="emoji-events" size={64} color="#FFD700" />
            </View>
            <Text style={[styles.resultTitle, { color: '#4CAF50' }]}>
              게임 완료! 🎉
            </Text>
            <Text style={styles.resultSubtitle}>
              내기가 완료되었습니다
            </Text>

            {winner && (
              <View style={styles.winnerCard}>
                <View style={styles.winnerAvatar}>
                  <Text style={{ color: '#fff', fontWeight: '700', fontSize: 18 }}>
                    {winner.name.charAt(0)}
                  </Text>
                </View>
                <View>
                  <Text style={styles.winnerName}>{winner.name}</Text>
                  <Text style={styles.winnerLabel}>승리자</Text>
                </View>
              </View>
            )}
          </View>

          {/* 내기 정보 */}
          <View style={styles.betInfoCard}>
            <Text style={styles.betTitle}>{bet.title}</Text>
            <Text style={styles.betStake}>🎯 {bet.stake}</Text>
            <View style={styles.gameInfo}>
              <Icon name={getGameIcon(bet.gameType)} size={16} color={colors.primary} />
              <Text style={styles.gameText}>{getGameLabel(bet.gameType)}</Text>
            </View>
          </View>

          {/* 게임 데이터 */}
          {renderGameData()}

          {/* 메타 정보 */}
          <View style={styles.metaInfo}>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>완료 시간</Text>
              <Text style={styles.metaValue}>
                {bet.completedAt
                  ? new Date(bet.completedAt).toLocaleDateString('ko-KR')
                  : '-'
                }
              </Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>소요 시간</Text>
              <Text style={styles.metaValue}>
                {bet.completedAt && bet.createdAt
                  ? `${Math.round((new Date(bet.completedAt).getTime() - new Date(bet.createdAt).getTime()) / 60000)}분`
                  : '-'
                }
              </Text>
            </View>
            <View style={[styles.metaRow, { marginBottom: 0 }]}>
              <Text style={styles.metaLabel}>참가자</Text>
              <Text style={styles.metaValue}>{users.length}명</Text>
            </View>
          </View>

          {/* 목록으로 돌아가기 */}
          <TouchableOpacity
            style={styles.backToListButton}
            onPress={() => navigation.navigate('BetMain')}
          >
            <Icon name="list" size={20} color="#fff" />
            <Text style={styles.backToListText}>내기 목록으로</Text>
          </TouchableOpacity>
        </View>
      </CustomScrollView>
    </SafeAreaView>
  );
}
