import React, { useCallback, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { addDays, format } from 'date-fns';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAppStore } from '../../store/appStore';
import { useTheme } from '../../store/themeStore';
import { AnniversaryCard } from '../../components/anniversary/AnniversaryCard';
import { UpcomingSchedules } from '../../components/calendar/UpcomingSchedules';
import { BudgetSummary } from '../../components/budget/BudgetSummary';
import { CustomScrollView } from '../../components/CustomScrollView.tsx';
import { useFocusEffect } from '@react-navigation/native';

const createStyles = (colors: any) => StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: colors.surface,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  noCoupleSubtitle: {
    fontSize: 16,
    color: colors.secondary,
    fontStyle: 'italic',
  },
  coupleInviteCard: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: 16,
    padding: 20,
    margin: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
  },
  coupleInviteTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
  },
  coupleInviteText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  inviteButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  inviteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  seeMore: {
    fontSize: 14,
    color: colors.secondary,
    fontWeight: '500',
  },
  anniversaryCard: {
    marginRight: 15,
  },
  lastCard: {
    marginRight: 20,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: colors.surface,
    borderRadius: 15,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
    marginBottom: 15,
  },
  addButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  // ✅ 디버그 정보 스타일 추가
  debugContainer: {
    backgroundColor: '#f0f0f0',
    margin: 20,
    padding: 10,
    borderRadius: 8,
  },
  debugText: {
    fontSize: 12,
    color: '#333',
    marginBottom: 2,
  },
  // 반성문 섹션 스타일
  reflectionCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  reflectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reflectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
    marginRight: 10,
  },
  reflectionStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 60,
    alignItems: 'center',
  },
  statusPending: {
    backgroundColor: '#FEF3C7',
  },
  statusApproved: {
    backgroundColor: '#D1FAE5',
  },
  statusRejected: {
    backgroundColor: '#FEE2E2',
  },
  reflectionStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusTextPending: {
    color: '#92400E',
  },
  statusTextApproved: {
    color: '#065F46',
  },
  statusTextRejected: {
    color: '#991B1B',
  },
  reflectionMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reflectionAuthor: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  reflectionDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  reflectionSummary: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  reflectionCount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 5,
  },
  reflectionCountLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 15,
  },
});

export function DashboardScreen({ navigation }: any) {
  const colors = useTheme();
  const {
    user,
    couple,
    dashboardData,           // ✅ dashboardData 직접 사용
    isLoadingDashboard,      // ✅ 로딩 상태
    loadDashboardData,       // ✅ 데이터 로드 함수
    getTotalBudget,
    getPendingReflections,   // 반성문 헬퍼 함수
    getRecentReflections,    // 반성문 헬퍼 함수
  } = useAppStore();

  const styles = createStyles(colors);

  // ✅ 컴포넌트 마운트 시 대시보드 데이터 로드 확인
  useFocusEffect(
    useCallback(() => {
      if (user) {
        loadDashboardData().catch((error) =>
          console.error('대시보드 데이터를 가져오는 중 오류 발생:', error)
        );
      }
    }, [user, loadDashboardData])
  );



  // 🔥 로그인이 안 되어 있으면 로그인 필요 메시지
  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>로그인이 필요합니다</Text>
        </View>
      </View>
    );
  }

  // ✅ dashboardData에서 직접 데이터 가져오기
  const daysFromStart = dashboardData?.stats?.daysFromStart || 0;
  const upcomingAnniversaries = dashboardData?.upcomingAnniversaries || [];
  const todaySchedules = dashboardData?.todaySchedules || [];
  const tomorrowSchedules = dashboardData?.tomorrowSchedules || [];

  // 반성문 데이터
  const pendingReflections = getPendingReflections();
  const recentReflections = getRecentReflections();

  console.log('🔍 Dashboard Data Status:', {
    hasDashboardData: !!dashboardData,
    isLoading: isLoadingDashboard,
    upcomingAnniversariesCount: upcomingAnniversaries.length,
    todaySchedulesCount: todaySchedules.length,
    tomorrowSchedulesCount: tomorrowSchedules.length,
    daysFromStart,
    pendingReflectionsCount: pendingReflections.length,
    recentReflectionsCount: recentReflections.length,
  });

  const budgetSummary = getTotalBudget();

  // 🔥 커플이 없을 때의 파트너 이름 처리
  const partnerName = couple
    ? couple.users.find(u => u.id !== user.id)?.name || '파트너'
    : null;

  // 반성문 상태별 텍스트
  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return '결재 대기';
      case 'approved': return '승인됨';
      case 'rejected': return '반려됨';
      default: return '알 수 없음';
    }
  };

  // 반성문 날짜 포맷
  const formatReflectionDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'MM/dd');
  };

  return (
    <CustomScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.greeting}>안녕하세요, {user.name}님! 💕</Text>
        {couple ? (
          <Text style={styles.subtitle}>
            {partnerName}님과 함께한 지 {daysFromStart}일째
          </Text>
        ) : (
          <Text style={styles.noCoupleSubtitle}>
            아직 커플이 연결되지 않았습니다
          </Text>
        )}
      </View>


      {/* 🔥 커플이 없을 때 초대 카드 표시 */}
      {!couple && (
        <View style={styles.coupleInviteCard}>
          <Icon name="favorite-border" size={48} color={colors.primary} />
          <Text style={styles.coupleInviteTitle}>커플 연결하기</Text>
          <Text style={styles.coupleInviteText}>
            파트너를 초대하거나 초대를 받아{'\n'}
            함께 소중한 추억을 만들어보세요!
          </Text>
          <TouchableOpacity
            style={styles.inviteButton}
            onPress={() => navigation.navigate('CoupleInvite')}
          >
            <Text style={styles.inviteButtonText}>커플 초대하기</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 반성문 섹션 - 커플이 있을 때만 표시 */}
      {couple && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>반성문 현황</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Reflection')}>
              <Text style={styles.seeMore}>더보기</Text>
            </TouchableOpacity>
          </View>

          {pendingReflections.length > 0 ? (
            <View style={styles.reflectionSummary}>
              <Text style={styles.reflectionCount}>{pendingReflections.length}</Text>
              <Text style={styles.reflectionCountLabel}>결재 요청 대기 중</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => navigation.navigate('Reflection')}
              >
                <Text style={styles.addButtonText}>반성문 확인하기</Text>
              </TouchableOpacity>
            </View>
          ) : recentReflections.length > 0 ? (
            <View>
              {recentReflections.map((reflection) => (
                <View key={reflection.id} style={styles.reflectionCard}>
                  <View style={styles.reflectionHeader}>
                    <Text style={styles.reflectionTitle} numberOfLines={1}>
                      {reflection.incident.substring(0, 20)}...
                    </Text>
                    <View style={[
                      styles.reflectionStatus,
                      reflection.status === 'pending' && styles.statusPending,
                      reflection.status === 'approved' && styles.statusApproved,
                      reflection.status === 'rejected' && styles.statusRejected,
                    ]}>
                      <Text style={[
                        styles.reflectionStatusText,
                        reflection.status === 'pending' && styles.statusTextPending,
                        reflection.status === 'approved' && styles.statusTextApproved,
                        reflection.status === 'rejected' && styles.statusTextRejected,
                      ]}>
                        {getStatusText(reflection.status)}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.reflectionMeta}>
                    <Text style={styles.reflectionAuthor}>{reflection.author}</Text>
                    <Text style={styles.reflectionDate}>
                      {formatReflectionDate(reflection.createdAt)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Icon name="assignment" size={48} color="#ccc" />
              <Text style={styles.emptyText}>아직 작성된 반성문이 없습니다</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => navigation.navigate('Reflection')}
              >
                <Text style={styles.addButtonText}>반성문 작성하기</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* ✅ 기념일 카드 - dashboardData 사용 */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>다가오는 기념일</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Calendar')}>
            <Text style={styles.seeMore}>더보기</Text>
          </TouchableOpacity>
        </View>

        {isLoadingDashboard ? (
          <View style={styles.emptyState}>
            <Icon name="refresh" size={48} color="#ccc" />
            <Text style={styles.emptyText}>기념일을 불러오는 중...</Text>
          </View>
        ) : upcomingAnniversaries.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {upcomingAnniversaries.map((anniversary, index) => (
              <AnniversaryCard
                key={anniversary.id}
                anniversary={anniversary}
                style={[
                  styles.anniversaryCard,
                  index === upcomingAnniversaries.length - 1 && styles.lastCard,
                ]}
              />
            ))}
          </ScrollView>
        ) : (
          <View style={styles.emptyState}>
            <Icon name="celebration" size={48} color="#ccc" />
            <Text style={styles.emptyText}>등록된 기념일이 없습니다</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => navigation.navigate('AnniversaryAdd')}
            >
              <Text style={styles.addButtonText}>기념일 추가하기</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* ✅ 오늘의 일정 - dashboardData 사용 */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>오늘의 일정</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Calendar')}>
            <Text style={styles.seeMore}>더보기</Text>
          </TouchableOpacity>
        </View>

        {isLoadingDashboard ? (
          <View style={styles.emptyState}>
            <Icon name="refresh" size={48} color="#ccc" />
            <Text style={styles.emptyText}>일정을 불러오는 중...</Text>
          </View>
        ) : (
          <UpcomingSchedules
            schedules={todaySchedules}
            title="오늘"
            emptyMessage="오늘 일정이 없습니다"
            onPress={() => navigation.navigate('TodoAdd')}
          />
        )}
      </View>

      {/* ✅ 내일의 일정 - dashboardData 사용 */}
      {tomorrowSchedules.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>내일의 일정</Text>
          <UpcomingSchedules
            schedules={tomorrowSchedules}
            title="내일"
            emptyMessage=""
            onPress={() => navigation.navigate('Calendar')}
          />
        </View>
      )}

      {/* 🔥 커플이 있을 때만 가계부 요약 표시 */}
      {couple && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>이번 달 데이트 비용</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Budget')}>
              <Text style={styles.seeMore}>더보기</Text>
            </TouchableOpacity>
          </View>

          <BudgetSummary
            totalAmount={budgetSummary.total}
            userExpenses={budgetSummary.byUser}
            users={couple.users}
            onPress={() => navigation.navigate('Budget')}
          />
        </View>
      )}
    </CustomScrollView>
  );
}
