import React, { useState, useEffect } from 'react';
import {
  Dimensions,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../store/themeStore';
import { useBudgetStore } from '../../store/budgetStore';
import { useAppStore } from '../../store/appStore';
import { CustomScrollView } from '../../components/CustomScrollView.tsx';
import { budgetService } from '../../services/BudgetService';

const { width } = Dimensions.get('window');

// 🎨 테마 시스템과 연동된 스타일 생성 함수
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
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  monthButton: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: 20,
    padding: 8,
  },
  monthText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
    minWidth: 100,
    textAlign: 'center',
  },
  content: {
    padding: 20,
  },
  statsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statIcon: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: 20,
    padding: 8,
    marginBottom: 8,
  },
  statValue: {
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
  expenseCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  expenseTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  balanceText: {
    fontSize: 14,
    fontWeight: '600',
  },
  userExpenses: {
    gap: 12,
  },
  userRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surfaceVariant,
    borderRadius: 12,
    padding: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 12,
  },
  userAmountContainer: {
    alignItems: 'flex-end',
  },
  userAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  userPercentage: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: (width - 64) / 2,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryIcon: {
    marginBottom: 8,
  },
  categoryAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
  },
  categoryLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  recentSection: {
    marginBottom: 24,
  },
  recentItem: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  recentAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.secondary,
  },
  recentDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recentInfo: {
    fontSize: 12,
    color: '#666',
  },
  recentCategory: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
});

export function BudgetScreen({ navigation }: any) {
  const colors = useTheme();
  const { budgetItems, calculateStats, getUserExpenses, getCategoryExpenses, setBudgetItems } = useBudgetStore();
  const { couple } = useAppStore();
  // users는 couple.users에서 가져옴
  const users = couple?.users || [];
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  console.log('couple ' , couple)

  const currentMonthKey = selectedMonth.toISOString().slice(0, 7);

  const categoryData = [
    { key: 'food', label: '식비', icon: 'restaurant', color: colors.accent1 },
    { key: 'entertainment', label: '오락', icon: 'movie', color: colors.accent2 },
    { key: 'transport', label: '교통', icon: 'directions-car', color: colors.secondary },
    { key: 'shopping', label: '쇼핑', icon: 'shopping-bag', color: colors.primary },
    { key: 'travel', label: '여행', icon: 'flight', color: '#9C27B0' },
    { key: 'health', label: '건강', icon: 'local-hospital', color: '#9C27B0' },
    { key: 'other', label: '기타', icon: 'more-horiz', color: '#607D8B' },
  ];

  // 데이터 Fetch 후 상태 업데이트
  useEffect(() => {
    const fetchBudgetItems = async () => {
      const items = await budgetService.getBudgetItems(currentMonthKey);
      console.log('items ', items.data)
      setBudgetItems(items.data);
    };

    fetchBudgetItems();
  }, [currentMonthKey, setBudgetItems]);

  const stats = calculateStats(currentMonthKey);


  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(amount);
  };

  const goToPreviousMonth = () => {
    const newDate = new Date(selectedMonth);
    newDate.setMonth(newDate.getMonth() - 1);
    setSelectedMonth(newDate);
  };

  const goToNextMonth = () => {
    const newDate = new Date(selectedMonth);
    newDate.setMonth(newDate.getMonth() + 1);
    setSelectedMonth(newDate);
  };

  const handleAddExpense = () => {
    navigation.navigate('BudgetAdd');
  };

  const monthItems = Array.isArray(budgetItems) // ✅ 배열인지 확인
    ? budgetItems
      .filter((item) => item.expenseDate.startsWith(currentMonthKey))
  : [];

  const recentItems =
    Array.isArray(monthItems) // ✅ 배열인지 확인
      ? monthItems
        .sort((a, b) => new Date(b.expenseDate).getTime() - new Date(a.expenseDate).getTime()) // ✅ expenseDate 기준 내림차순
        .slice(0, 5)
      : []; // 배열이 아닌 경우 빈 배열 반환


  // 정산 계산
  const calculateBalance = () => {
    if (!users || users.length === 0) {
      return '사용자 정보가 없습니다';
    }

    const userExpenses = users.map(user => ({
      ...user,
      spent: getUserExpenses(user.id, currentMonthKey)
    }));

    if (userExpenses.length === 2) {
      const [user1, user2] = userExpenses;
      const difference = user1.spent - user2.spent;

      if (difference > 0) {
        return `${user2.name}이(가) ${user1.name}에게 ${formatCurrency(difference / 2)}`;
      } else if (difference < 0) {
        return `${user1.name}이(가) ${user2.name}에게 ${formatCurrency(Math.abs(difference) / 2)}`;
      } else {
        return '정산 완료! 동일한 금액입니다';
      }
    }

    return '정산 정보를 계산할 수 없습니다';
  };

  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>💰 가계부</Text>
          <TouchableOpacity style={styles.addButton} onPress={handleAddExpense}>
            <Icon name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* 월 선택기 */}
        <View style={styles.monthSelector}>
          <TouchableOpacity onPress={goToPreviousMonth} style={styles.monthButton}>
            <Icon name="chevron-left" size={24} color={colors.primary} />
          </TouchableOpacity>

          <Text style={styles.monthText}>
            {selectedMonth.toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long'
            })}
          </Text>

          <TouchableOpacity onPress={goToNextMonth} style={styles.monthButton}>
            <Icon name="chevron-right" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <CustomScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 통계 섹션 */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>📊 이번 달 요약</Text>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Icon name="account-balance-wallet" size={24} color={colors.primary} />
              </View>
              <Text style={styles.statValue}>{formatCurrency(stats.totalSpent)}</Text>
              <Text style={styles.statLabel}>총 지출</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Icon name="trending-up" size={24} color={colors.secondary} />
              </View>
              <Text style={styles.statValue}>{monthItems.length}</Text>
              <Text style={styles.statLabel}>지출 건수</Text>
            </View>
          </View>

          {/* 사용자별 지출 */}
          {users.length > 0 && (
            <View style={styles.expenseCard}>
              <View style={styles.expenseHeader}>
                <Text style={styles.expenseTitle}>👥 사용자별 지출</Text>
              </View>

              <View style={styles.userExpenses}>
                {users.map(user => {
                  const userAmount = getUserExpenses(user.id, currentMonthKey);
                  const percentage = stats.totalSpent > 0 ? (userAmount / stats.totalSpent) * 100 : 0;

                  return (
                    <View key={user.id} style={styles.userRow}>
                      <View style={styles.userInfo}>
                        <Icon name="person" size={20} color={colors.primary} />
                        <Text style={styles.userName}>{user.name}</Text>
                      </View>
                      <View style={styles.userAmountContainer}>
                        <Text style={styles.userAmount}>{formatCurrency(userAmount)}</Text>
                        <Text style={styles.userPercentage}>({percentage.toFixed(0)}%)</Text>
                      </View>
                    </View>
                  );
                })}
              </View>

              {/* 정산 정보 */}
              <View style={{
                backgroundColor: colors.primaryLight + '20',
                borderRadius: 12,
                padding: 12,
                marginTop: 16,
                alignItems: 'center'
              }}>
                <Text style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: colors.primary,
                  textAlign: 'center'
                }}>
                  {calculateBalance()}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* 카테고리별 지출 */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>🏷️ 카테고리별 지출</Text>

          <View style={styles.categoryGrid}>
            {categoryData.map(category => {
              const amount = getCategoryExpenses(category.key, currentMonthKey);

              return (
                <View key={category.key} style={styles.categoryCard}>
                  <View style={[styles.categoryIcon, { backgroundColor: category.color + '20' }]}>
                    <Icon name={category.icon} size={24} color={category.color} />
                  </View>
                  <Text style={styles.categoryAmount}>{formatCurrency(amount)}</Text>
                  <Text style={styles.categoryLabel}>{category.label}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* 최근 지출 내역 */}
        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>📝 최근 지출 내역</Text>

          {recentItems.length > 0 ? (
            recentItems.map(item => {
              const category = categoryData.find(cat => cat.key === item.category);
              const user = users.find(u => u.id === item.paidBy);

              return (
                <View key={item.id} style={styles.recentItem}>
                  <View style={styles.recentHeader}>
                    <Text style={styles.recentTitle}>{item.title}</Text>
                    <Text style={styles.recentAmount}>{formatCurrency(item.amount)}</Text>
                  </View>
                  <View style={styles.recentDetails}>
                    <Text style={styles.recentInfo}>
                      {new Date(item.expenseDate).toLocaleDateString('ko-KR')} • {user?.name || '알 수 없음'}
                    </Text>
                    <Text style={styles.recentCategory}>{category?.label || item.category}</Text>
                  </View>
                </View>
              );
            })
          ) : (
            <View style={styles.recentItem}>
              <Text style={{ textAlign: 'center', color: '#666' }}>
                이번 달 지출 내역이 없습니다.
              </Text>
            </View>
          )}
        </View>
      </CustomScrollView>
    </SafeAreaView>
  );
}
