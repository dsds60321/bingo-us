import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAppStore } from '../store/appStore';
import { LoadingSpinner } from '../components/LoadingSpinner';

// Auth 화면들
import { LoginScreen, SignupScreen } from '../screens/Login/Auth';

// 기존 화면들
import { BottomTabNavigator } from './BottomTabNavigator';
import { BudgetAddScreen } from '../screens/Budget/BudgetAddScreen';
import { AnniversaryAddScreen } from '../screens/Anniversary/AnniversaryAddScreen';
import { ScheduleAddScreen } from '../screens/Calendar/ScheduleAddScreen';
import { BetAddScreen } from '../screens/Bet/BetAddScreen';
import { TodoAddScreen } from '../screens/Todo/TodoAddScreen';

// 🎮 Bet 관련 화면들 추가!
import { BetDetailScreen } from '../screens/Bet/BetDetailScreen';
import { BetResultScreen } from '../screens/Bet/BetResultScreen';

// 💕 Couple 관련 화면들 추가!
import { CoupleInviteScreen } from '../screens/Couple/CoupleInviteScreen';

const Stack = createStackNavigator();

// Deep Link 설정
const linking = {
  prefixes: ['bingous://'],
  config: {
    screens: {
      Signup: {
        path: '/signup',
        parse: {
          token: (token: string) => token,
        },
      },
    },
  },
};


export function AppNavigator() {
  const { isAuthenticated, isLoading } = useAppStore();

  // 로딩 중일 때는 로딩 화면 표시
  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <NavigationContainer linking={linking}>
    <Stack.Navigator
        screenOptions={{
          headerShown: false,
          gestureEnabled: true,
          cardStyleInterpolator: ({ current, layouts }) => {
            return {
              cardStyle: {
                transform: [
                  {
                    translateX: current.progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [layouts.screen.width, 0],
                    }),
                  },
                ],
              },
            };
          },
        }}
      >
        {!isAuthenticated ? (
          // 🔐 인증되지 않은 경우 - Auth 화면들
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{
                animationTypeForReplace: 'pop',
              }}
            />
            <Stack.Screen
              name="Signup"
              component={SignupScreen}
              options={{
                cardStyleInterpolator: ({ current, layouts }) => {
                  return {
                    cardStyle: {
                      transform: [
                        {
                          translateY: current.progress.interpolate({
                            inputRange: [0, 1],
                            outputRange: [layouts.screen.height, 0],
                          }),
                        },
                      ],
                    },
                  };
                },
              }}
            />
          </>
        ) : (
          // 🏠 인증된 경우 - 메인 앱 화면들
          <>
            <Stack.Screen
              name="Main"
              component={BottomTabNavigator}
              options={{
                animationTypeForReplace: 'push',
              }}
            />

            {/* 💕 Couple 관련 화면들 */}
            <Stack.Screen
              name="CoupleInvite"
              component={CoupleInviteScreen}
              options={{
                cardStyleInterpolator: ({ current, layouts }) => {
                  return {
                    cardStyle: {
                      transform: [
                        {
                          translateX: current.progress.interpolate({
                            inputRange: [0, 1],
                            outputRange: [layouts.screen.width, 0],
                          }),
                        },
                      ],
                    },
                  };
                },
              }}
            />

            {/* 📝 Add 화면들 (모달 스타일) */}
            <Stack.Screen
              name="BudgetAdd"
              component={BudgetAddScreen}
              options={{
                presentation: 'modal',
                cardStyleInterpolator: ({ current, layouts }) => {
                  return {
                    cardStyle: {
                      transform: [
                        {
                          translateY: current.progress.interpolate({
                            inputRange: [0, 1],
                            outputRange: [layouts.screen.height, 0],
                          }),
                        },
                      ],
                    },
                  };
                },
              }}
            />
            <Stack.Screen
              name="AnniversaryAdd"
              component={AnniversaryAddScreen}
              options={{
                presentation: 'modal',
                cardStyleInterpolator: ({ current, layouts }) => {
                  return {
                    cardStyle: {
                      transform: [
                        {
                          translateY: current.progress.interpolate({
                            inputRange: [0, 1],
                            outputRange: [layouts.screen.height, 0],
                          }),
                        },
                      ],
                    },
                  };
                },
              }}
            />
            <Stack.Screen
              name="ScheduleAdd"
              component={ScheduleAddScreen}
              options={{
                presentation: 'modal',
                cardStyleInterpolator: ({ current, layouts }) => {
                  return {
                    cardStyle: {
                      transform: [
                        {
                          translateY: current.progress.interpolate({
                            inputRange: [0, 1],
                            outputRange: [layouts.screen.height, 0],
                          }),
                        },
                      ],
                    },
                  };
                },
              }}
            />
            <Stack.Screen
              name="BetAdd"
              component={BetAddScreen}
              options={{
                presentation: 'modal',
                cardStyleInterpolator: ({ current, layouts }) => {
                  return {
                    cardStyle: {
                      transform: [
                        {
                          translateY: current.progress.interpolate({
                            inputRange: [0, 1],
                            outputRange: [layouts.screen.height, 0],
                          }),
                        },
                      ],
                    },
                  };
                },
              }}
            />
            <Stack.Screen
              name="TodoAdd"
              component={TodoAddScreen}
              options={{
                presentation: 'modal',
                cardStyleInterpolator: ({ current, layouts }) => {
                  return {
                    cardStyle: {
                      transform: [
                        {
                          translateY: current.progress.interpolate({
                            inputRange: [0, 1],
                            outputRange: [layouts.screen.height, 0],
                          }),
                        },
                      ],
                    },
                  };
                },
              }}
            />

            {/* 🎮 Bet 상세/결과 화면들 (일반 push 스타일) */}
            <Stack.Screen
              name="BetDetail"
              component={BetDetailScreen}
              options={{
                cardStyleInterpolator: ({ current, layouts }) => {
                  return {
                    cardStyle: {
                      transform: [
                        {
                          translateX: current.progress.interpolate({
                            inputRange: [0, 1],
                            outputRange: [layouts.screen.width, 0],
                          }),
                        },
                      ],
                    },
                  };
                },
              }}
            />
            <Stack.Screen
              name="BetResult"
              component={BetResultScreen}
              options={{
                cardStyleInterpolator: ({ current, layouts }) => {
                  return {
                    cardStyle: {
                      transform: [
                        {
                          translateX: current.progress.interpolate({
                            inputRange: [0, 1],
                            outputRange: [layouts.screen.width, 0],
                          }),
                        },
                      ],
                    },
                  };
                },
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
