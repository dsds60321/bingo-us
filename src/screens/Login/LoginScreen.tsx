import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../store/themeStore';
import { useAppStore } from '../../store/appStore';
import { CustomScrollView } from '../../components/CustomScrollView.tsx';

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    keyboardAvoidingView: {
      flex: 1,
    },
    scrollView: {
      flexGrow: 1,
      justifyContent: 'center',
    },
    content: {
      padding: 20,
    },
    logoContainer: {
      alignItems: 'center',
      marginBottom: 50,
    },
    logo: {
      fontSize: 48,
      marginBottom: 16,
    },
    appName: {
      fontSize: 28,
      fontWeight: '800',
      color: colors.primary,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: '#666',
      textAlign: 'center',
    },
    formContainer: {
      backgroundColor: colors.surface,
      borderRadius: 24,
      padding: 24,
      marginBottom: 20,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 8,
    },
    formTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.primary,
      textAlign: 'center',
      marginBottom: 24,
    },
    inputContainer: {
      marginBottom: 16,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.primary,
      marginBottom: 8,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surfaceVariant,
      borderRadius: 16,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    inputFocused: {
      borderColor: colors.primary,
    },
    inputIcon: {
      paddingLeft: 16,
    },
    input: {
      flex: 1,
      padding: 16,
      fontSize: 16,
      color: '#333',
    },
    loginButton: {
      backgroundColor: colors.primary,
      borderRadius: 16,
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      marginTop: 8,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
    loginButtonDisabled: {
      backgroundColor: '#CCC',
      shadowOpacity: 0,
      elevation: 0,
    },
    loginButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '700',
    },
    divider: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 24,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: '#E0E0E0',
    },
    dividerText: {
      marginHorizontal: 16,
      fontSize: 14,
      color: '#666',
    },
    signupButton: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      borderWidth: 2,
      borderColor: colors.primary,
    },
    signupButtonText: {
      color: colors.primary,
      fontSize: 16,
      fontWeight: '700',
    },
    forgotPassword: {
      alignItems: 'center',
      marginTop: 16,
    },
    forgotPasswordText: {
      fontSize: 14,
      color: colors.secondary,
      fontWeight: '500',
    },
    // 🎯 데모 계정 정보
    demoInfo: {
      backgroundColor: colors.surfaceVariant,
      borderRadius: 12,
      padding: 16,
      marginBottom: 20,
      borderLeftWidth: 4,
      borderLeftColor: colors.accent1,
    },
    demoTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.primary,
      marginBottom: 8,
    },
    demoAccount: {
      fontSize: 12,
      color: '#666',
      marginBottom: 4,
      fontFamily: 'monospace',
    },
    quickLoginButton: {
      backgroundColor: colors.accent1,
      borderRadius: 12,
      padding: 12,
      marginTop: 8,
      alignItems: 'center',
    },
    quickLoginText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: '600',
    },
  });

export function LoginScreen({ navigation }: any) {
  const colors = useTheme();
  const { login, isLoading } = useAppStore();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!username.trim()) {
      Alert.alert('알림', '아이디를 입력해주세요.');
      return;
    }

    if (!password.trim()) {
      Alert.alert('알림', '비밀번호를 입력해주세요.');
      return;
    }

    try {
      const success = await login(username, password);

      if (success) {
        // 로그인 성공 - 네비게이션은 AppNavigator에서 자동 처리
        console.log('✅ 로그인 성공!');
      } else {
        Alert.alert('로그인 실패', '아이디 또는 비밀번호를 확인해주세요.');
      }
    } catch (error) {
      Alert.alert('오류', '로그인 중 문제가 발생했습니다.');
    }
  };

  const handleSignup = () => {
    navigation.navigate('Signup');
  };

  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <CustomScrollView
          contentContainerStyle={styles.scrollView}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            {/* 로고 및 앱 이름 */}
            <View style={styles.logoContainer}>
              <Text style={styles.logo}>💕</Text>
              <Text style={styles.appName}>커플 다이어리</Text>
              <Text style={styles.subtitle}>
                소중한 사람과 함께하는{'\n'}특별한 순간들을 기록해보세요
              </Text>
            </View>

            {/* 로그인 폼 */}
            <View style={styles.formContainer}>
              <Text style={styles.formTitle}>로그인</Text>

              {/* 아이디 입력 */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>아이디</Text>
                <View style={[
                  styles.inputWrapper,
                  focusedInput === 'username' && styles.inputFocused
                ]}>
                  <Icon
                    name="person"
                    size={20}
                    color={focusedInput === 'username' ? colors.primary : '#666'}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="아이디를 입력하세요"
                    placeholderTextColor="#B0B0B0"
                    value={username}
                    onChangeText={setUsername}
                    onFocus={() => setFocusedInput('username')}
                    onBlur={() => setFocusedInput(null)}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isLoading}
                  />
                </View>
              </View>

              {/* 비밀번호 입력 */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>비밀번호</Text>
                <View style={[
                  styles.inputWrapper,
                  focusedInput === 'password' && styles.inputFocused
                ]}>
                  <Icon
                    name="lock"
                    size={20}
                    color={focusedInput === 'password' ? colors.primary : '#666'}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="비밀번호를 입력하세요"
                    placeholderTextColor="#B0B0B0"
                    value={password}
                    onChangeText={setPassword}
                    onFocus={() => setFocusedInput('password')}
                    onBlur={() => setFocusedInput(null)}
                    secureTextEntry
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isLoading}
                  />
                </View>
              </View>

              {/* 로그인 버튼 */}
              <TouchableOpacity
                style={[
                  styles.loginButton,
                  isLoading && styles.loginButtonDisabled
                ]}
                onPress={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Icon name="login" size={20} color="#fff" />
                )}
                <Text style={styles.loginButtonText}>
                  {isLoading ? '로그인 중...' : '로그인'}
                </Text>
              </TouchableOpacity>

              {/* 비밀번호 찾기 */}
              <TouchableOpacity style={styles.forgotPassword}>
                <Text style={styles.forgotPasswordText}>비밀번호를 잊으셨나요?</Text>
              </TouchableOpacity>
            </View>

            {/* 구분선 */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>또는</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* 회원가입 버튼 */}
            <TouchableOpacity
              style={styles.signupButton}
              onPress={handleSignup}
              disabled={isLoading}
            >
              <Icon name="person-add" size={20} color={colors.primary} />
              <Text style={styles.signupButtonText}>새 계정 만들기</Text>
            </TouchableOpacity>
          </View>
        </CustomScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
