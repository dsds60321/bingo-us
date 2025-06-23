import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { User } from '../../types';
import { useTheme } from '../../store/themeStore';

interface BudgetSummaryProps {
  totalAmount: number;
  userExpenses: { [userId: string]: number };
  users: User[];
  onPress: () => void;
}

//  테마 시스템과 연동된 스타일 생성 함수
const createStyles = (colors: any) => StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleSection: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.secondary,
  },
  chevron: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: 20,
    padding: 8,
  },
  userExpenses: {
    borderTopWidth: 1,
    borderTopColor: colors.surfaceVariant,
    paddingTop: 16,
    gap: 12,
  },
  userRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surfaceVariant,
    borderRadius: 12,
    padding: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
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
  balanceInfo: {
    backgroundColor: colors.primaryLight + '20',
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
    alignItems: 'center',
  },
  balanceText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    textAlign: 'center',
  },
});

export function BudgetSummary({ totalAmount, userExpenses, users, onPress }: BudgetSummaryProps) {
  const colors = useTheme();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(amount);
  };

  // 정산 계산
  const calculateBalance = () => {
    const userExpensesList = users.map(user => ({
      ...user,
      spent: userExpenses[user.id] || 0
    }));

    if (userExpensesList.length === 2) {
      const [user1, user2] = userExpensesList;
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
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.titleSection}>
          <Text style={styles.title}> 이번 달 지출</Text>
          <Text style={styles.totalAmount}>{formatCurrency(totalAmount)}</Text>
        </View>
        <View style={styles.chevron}>
          <Icon name="chevron-right" size={20} color={colors.primary} />
        </View>
      </View>

      <View style={styles.userExpenses}>
        {users.map(user => {
          const userAmount = userExpenses[user.id] || 0;
          const percentage = totalAmount > 0 ? (userAmount / totalAmount) * 100 : 0;

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
      <View style={styles.balanceInfo}>
        <Text style={styles.balanceText}>{calculateBalance()}</Text>
      </View>
    </TouchableOpacity>
  );
}
