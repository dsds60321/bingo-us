import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../store/themeStore';

// 화면 컴포넌트들
import { DashboardScreen } from '../screens/Dashboard/DashboardScreen';
import { CalendarScreen } from '../screens/Calendar/CalendarScreen';
import { BudgetScreen } from '../screens/Budget/BudgetScreen';
import { BetScreen } from '../screens/Bet/BetScreen';
import { SettingsScreen } from '../screens/Settings/SettingsScreen';

const Tab = createBottomTabNavigator();

export function BottomTabNavigator() {
  const colors = useTheme();

  const tabs = [
    {
      name: 'Dashboard',
      component: DashboardScreen,
      icon: 'home',
      label: '홈',
    },
    {
      name: 'Calendar',
      component: CalendarScreen,
      icon: 'calendar-today',
      label: '캘린더',
    },
    {
      name: 'Budget',
      component: BudgetScreen,
      icon: 'account-balance-wallet',
      label: '가계부',
    },
    {
      name: 'Bet',
      component: BetScreen,
      icon: 'casino',
      label: '내기',
    },
    {
      name: 'Settings',
      component: SettingsScreen,
      icon: 'settings',
      label: '설정',
    },
  ];

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 0,
          elevation: 20,
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
          height: 90,
          paddingBottom: 20,
          paddingTop: 10,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          position: 'absolute',
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
      }}
    >
      {tabs.map((tab) => (
        <Tab.Screen
          key={tab.name}
          name={tab.name}
          component={tab.component}
          options={{
            tabBarLabel: tab.label,
            tabBarIcon: ({ color, size }) => (
              <Icon name={tab.icon} size={size} color={color} />
            ),
          }}
        />
      ))}
    </Tab.Navigator>
  );
}
