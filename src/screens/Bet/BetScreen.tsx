import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
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
    padding: 20,
    paddingTop: 60,
    backgroundColor: colors.surface,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  addButton: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 8,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surfaceVariant,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 16,
  },
  betCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  betHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  betTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  betStake: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  betFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gameType: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  gameTypeText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  betDate: {
    fontSize: 12,
    color: '#666',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
  },
});

export function BetScreen({ navigation }: any) {
  const colors = useTheme();
  const { bets, getBetsByUser, getWinRate } = useBetStore();
  const { couple } = useAppStore();

  const users = couple?.users || [];
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const filteredBets = bets.filter(bet => {
    if (selectedFilter === 'all') return true;
    return bet.status === selectedFilter;
  });

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return { bg: colors.accent1 + '20', text: colors.accent1 };
      case 'in-progress':
        return { bg: colors.secondary + '20', text: colors.secondary };
      case 'completed':
        return { bg: '#4CAF50' + '20', text: '#4CAF50' };
      default:
        return { bg: '#666' + '20', text: '#666' };
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return '대기중';
      case 'in-progress':
        return '진행중';
      case 'completed':
        return '완료';
      default:
        return status;
    }
  };

  const handleBetPress = (bet: any) => {
    if (bet.status === 'pending') {
      navigation.navigate('BetDetail', { bet });
    } else if (bet.status === 'completed') {
      navigation.navigate('BetResult', { bet });
    }
  };

  const totalBets = bets.length;
  const wonBets = users.length > 0 ? bets.filter(bet => bet.winner === users[0].id).length : 0;
  const winRate = users.length > 0 ? getWinRate(users[0].id) : 0;

  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>🎮 내기</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('BetAdd')}
          >
            <Icon name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* 통계 */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{totalBets}</Text>
            <Text style={styles.statLabel}>총 내기</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{wonBets}</Text>
            <Text style={styles.statLabel}>승리</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{winRate.toFixed(0)}%</Text>
            <Text style={styles.statLabel}>승률</Text>
          </View>
        </View>
      </View>

      <CustomScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 필터 버튼들 */}
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 20 }}>
          {['all', 'pending', 'completed'].map(filter => (
            <TouchableOpacity
              key={filter}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor: selectedFilter === filter ? colors.primary : colors.surfaceVariant,
              }}
              onPress={() => setSelectedFilter(filter as any)}
            >
              <Text style={{
                color: selectedFilter === filter ? '#fff' : '#666',
                fontWeight: '600',
              }}>
                {filter === 'all' ? '전체' : filter === 'pending' ? '대기중' : '완료'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 내기 목록 */}
        <Text style={styles.sectionTitle}>📋 내기 목록</Text>

        {filteredBets.length > 0 ? (
          filteredBets.map(bet => {
            const statusColor = getStatusColor(bet.status);

            return (
              <TouchableOpacity
                key={bet.id}
                style={styles.betCard}
                onPress={() => handleBetPress(bet)}
              >
                <View style={styles.betHeader}>
                  <Text style={styles.betTitle}>{bet.title}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
                    <Text style={[styles.statusText, { color: statusColor.text }]}>
                      {getStatusLabel(bet.status)}
                    </Text>
                  </View>
                </View>

                <Text style={styles.betStake}>🎯 {bet.stake}</Text>

                <View style={styles.betFooter}>
                  <View style={styles.gameType}>
                    <Icon name={getGameIcon(bet.gameType)} size={16} color={colors.primary} />
                    <Text style={styles.gameTypeText}>{getGameLabel(bet.gameType)}</Text>
                  </View>

                  <Text style={styles.betDate}>
                    {new Date(bet.createdAt).toLocaleDateString('ko-KR')}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })
        ) : (
          <View style={styles.emptyState}>
            <Icon name="sports-esports" size={64} color="#E0E0E0" />
            <Text style={styles.emptyText}>
              {selectedFilter === 'all'
                ? '아직 내기가 없습니다.\n새로운 내기를 만들어보세요!'
                : `${getStatusLabel(selectedFilter)} 내기가 없습니다.`
              }
            </Text>
          </View>
        )}
      </CustomScrollView>
    </SafeAreaView>
  );
}
