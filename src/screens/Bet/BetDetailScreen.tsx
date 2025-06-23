import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../store/themeStore';
import { useBetStore } from '../../store/betStore';
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
  betCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  betTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  betDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  stakeCard: {
    backgroundColor: colors.accent1 + '15',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent1,
  },
  stakeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accent1,
    marginBottom: 8,
  },
  stakeText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  gameSection: {
    marginBottom: 24,
  },
  gameCard: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  gameIconContainer: {
    backgroundColor: colors.primary + '20',
    borderRadius: 16,
    padding: 16,
    marginRight: 16,
  },
  gameInfo: {
    flex: 1,
  },
  gameTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
  },
  gameDescription: {
    fontSize: 14,
    color: '#666',
  },
  participantsSection: {
    marginBottom: 32,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 12,
  },
  participantCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.surfaceVariant,
  },
  participantAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  participantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  startButton: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
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
});

interface Props {
  navigation: any;
  route: any;
}

export function BetDetailScreen({ navigation, route }: Props) {
  const colors = useTheme();
  const { updateBet } = useBetStore();
  const { couple } = useAppStore();
  const { bet } = route.params;

  const users = couple?.users || [];

  const getGameInfo = (gameType: string) => {
    switch (gameType) {
      case 'rock-paper-scissors':
        return {
          title: '가위바위보',
          description: '클래식한 가위바위보 게임',
          icon: 'back-hand',
        };
      case 'button-tap':
        return {
          title: '버튼 누르기',
          description: '제한 시간 내 버튼을 많이 누르는 게임',
          icon: 'touch-app',
        };
      case 'ladder-game':
        return {
          title: '사다리 타기',
          description: '사다리를 타고 운을 시험하는 게임',
          icon: 'linear-scale',
        };
      default:
        return {
          title: '게임',
          description: '게임 설명',
          icon: 'games',
        };
    }
  };

  const handleStartGame = () => {
    Alert.alert(
      '게임 시작! 🎮',
      '정말로 게임을 시작하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '시작',
          onPress: () => {
            // 내기 상태를 진행중으로 변경
            updateBet(bet.id, { status: 'in-progress' });

            // 게임 타입에 따라 다른 화면으로 이동
            switch (bet.gameType) {
              case 'rock-paper-scissors':
                navigation.navigate('RockPaperScissors', { bet });
                break;
              case 'button-tap':
                navigation.navigate('ButtonTap', { bet });
                break;
              case 'ladder-game':
                navigation.navigate('LadderGame', { bet });
                break;
              default:
                Alert.alert('알림', '지원하지 않는 게임입니다.');
            }
          },
        },
      ]
    );
  };

  const gameInfo = getGameInfo(bet.gameType);
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
          <Text style={styles.title}>내기 상세</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.content}>
          {/* 내기 정보 */}
          <View style={styles.betCard}>
            <Text style={styles.betTitle}>{bet.title}</Text>
            {bet.description && (
              <Text style={styles.betDescription}>{bet.description}</Text>
            )}
          </View>

          {/* 내기 내용 */}
          <View style={styles.stakeCard}>
            <Text style={styles.stakeLabel}>🎯 내기 내용</Text>
            <Text style={styles.stakeText}>{bet.stake}</Text>
          </View>

          {/* 게임 정보 */}
          <View style={styles.gameSection}>
            <Text style={styles.sectionLabel}>🎮 게임 정보</Text>
            <View style={styles.gameCard}>
              <View style={styles.gameIconContainer}>
                <Icon name={gameInfo.icon} size={32} color={colors.primary} />
              </View>
              <View style={styles.gameInfo}>
                <Text style={styles.gameTitle}>{gameInfo.title}</Text>
                <Text style={styles.gameDescription}>{gameInfo.description}</Text>
              </View>
            </View>
          </View>

          {/* 참가자 */}
          <View style={styles.participantsSection}>
            <Text style={styles.sectionLabel}>👥 참가자</Text>
            {users.map((user, index) => (
              <View key={user.id} style={styles.participantCard}>
                <View style={styles.participantAvatar}>
                  <Text style={{ color: '#fff', fontWeight: '700' }}>
                    {user.name.charAt(0)}
                  </Text>
                </View>
                <Text style={styles.participantName}>{user.name}</Text>
              </View>
            ))}
          </View>

          {/* 메타 정보 */}
          <View style={styles.metaInfo}>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>생성일</Text>
              <Text style={styles.metaValue}>
                {new Date(bet.createdAt).toLocaleDateString('ko-KR')}
              </Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>상태</Text>
              <Text style={styles.metaValue}>
                {bet.status === 'pending' ? '대기중' :
                  bet.status === 'in-progress' ? '진행중' : '완료'}
              </Text>
            </View>
            <View style={[styles.metaRow, { marginBottom: 0 }]}>
              <Text style={styles.metaLabel}>생성자</Text>
              <Text style={styles.metaValue}>
                {users.find(u => u.id === bet.createdBy)?.name || '알 수 없음'}
              </Text>
            </View>
          </View>

          {/* 게임 시작 버튼 */}
          <TouchableOpacity style={styles.startButton} onPress={handleStartGame}>
            <Icon name="play-arrow" size={24} color="#fff" />
            <Text style={styles.startButtonText}>게임 시작하기</Text>
          </TouchableOpacity>
        </View>
      </CustomScrollView>
    </SafeAreaView>
  );
}
