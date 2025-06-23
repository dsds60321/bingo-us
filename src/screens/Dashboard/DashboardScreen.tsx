import React from 'react';
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

// 🔥 createStyles 함수를 컴포넌트 위로 이동!
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
    color: colors.primary, // 🎨 테마 색상으로 변경
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
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
    color: colors.primary, // 🎨 테마 색상으로 변경
  },
  seeMore: {
    fontSize: 14,
    color: colors.secondary, // 🎨 secondary 색상 사용
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
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginBottom: 20,
    gap: 12, // 버튼 간격 추가
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  budgetButton: {
    backgroundColor: colors.secondary,
  },
  routeButton: {
    backgroundColor: colors.accent2,
  },
  actionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 5,
  },
});

export function DashboardScreen({ navigation }: any) {
  const colors = useTheme();
  const {
    user,
    couple,
    getDaysFromStart,
    getUpcomingAnniversaries,
    getTotalBudget,
    schedules,
  } = useAppStore();

  const daysFromStart = getDaysFromStart();
  const upcomingAnniversaries = getUpcomingAnniversaries();
  const budgetSummary = getTotalBudget();

  // 오늘과 내일의 일정 가져오기
  const todaySchedules = schedules.filter(
    schedule => schedule.date === format(new Date(), 'yyyy-MM-dd'),
  );

  const tomorrowSchedules = schedules.filter(
    schedule => schedule.date === format(addDays(new Date(), 1), 'yyyy-MM-dd'),
  );

  // 테마 기반 스타일 적용
  const styles = createStyles(colors);

  if (!user || !couple) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>로그인이 필요합니다</Text>
        </View>
      </View>
    );
  }

  const partnerName =
    couple.users.find(u => u.id !== user.id)?.name || '파트너';

  return (
    <CustomScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.greeting}>안녕하세요, {user.name}님! 💕</Text>
        <Text style={styles.subtitle}>
          {partnerName}님과 함께한 지 {daysFromStart}일째
        </Text>
      </View>

      {/* 기념일 카드 */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>다가오는 기념일</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Calendar')}>
            <Text style={styles.seeMore}>더보기</Text>
          </TouchableOpacity>
        </View>

        {upcomingAnniversaries.length > 0 ? (
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

      {/* 오늘의 일정 */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>오늘의 일정</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Calendar')}>
            <Text style={styles.seeMore}>더보기</Text>
          </TouchableOpacity>
        </View>

        <UpcomingSchedules
          schedules={todaySchedules}
          title="오늘"
          emptyMessage="오늘 일정이 없습니다"
          onPress={() => navigation.navigate('TodoAdd')}
        />
      </View>

      {/* 내일의 일정 */}
      {tomorrowSchedules.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>내일의 일정</Text>
          <UpcomingSchedules
            schedules={tomorrowSchedules}
            title="내일"
            emptyMessage=""
            onPress={() => navigation.navigate('캘린더')}
          />
        </View>
      )}

      {/* 가계부 요약 */}
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

      {/* 퀵 액션 버튼들 */}
      {/*<View style={styles.quickActions}>*/}
      {/*  <TouchableOpacity*/}
      {/*    style={styles.actionButton}*/}
      {/*    onPress={() => navigation.navigate('캘린더')}*/}
      {/*  >*/}
      {/*    <Icon name="event" size={24} color="#fff" />*/}
      {/*    <Text style={styles.actionText}>일정 추가</Text>*/}
      {/*  </TouchableOpacity>*/}

      {/*  <TouchableOpacity*/}
      {/*    style={[styles.actionButton, styles.budgetButton]}*/}
      {/*    onPress={() => navigation.navigate('가계부')}*/}
      {/*  >*/}
      {/*    <Icon name="attach-money" size={24} color="#fff" />*/}
      {/*    <Text style={styles.actionText}>가계부</Text>*/}
      {/*  </TouchableOpacity>*/}

      {/*  <TouchableOpacity*/}
      {/*    style={[styles.actionButton, styles.routeButton]}*/}
      {/*    onPress={() => navigation.navigate('경로')}*/}
      {/*  >*/}
      {/*    <Icon name="directions" size={24} color="#fff" />*/}
      {/*    <Text style={styles.actionText}>경로</Text>*/}
      {/*  </TouchableOpacity>*/}
      {/*</View>*/}
    </CustomScrollView>
  );
}
