import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
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
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
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
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '800',
    color: colors.primary,
    textAlign: 'center',
    marginRight: 40, // backButton 크기만큼 오프셋
  },
  content: {
    padding: 20,
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
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 14,
    color: '#666',
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
  required: {
    color: colors.error || '#FF6B6B',
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
  inputError: {
    borderColor: colors.error || '#FF6B6B',
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
  errorText: {
    fontSize: 12,
    color: colors.error || '#FF6B6B',
    marginTop: 4,
    marginLeft: 8,
  },
  passwordStrength: {
    marginTop: 8,
  },
  strengthBar: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    marginBottom: 4,
  },
  strengthFill: {
    height: '100%',
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 12,
    textAlign: 'center',
  },
  signupButton: {
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
  signupButtonDisabled: {
    backgroundColor: '#CCC',
    shadowOpacity: 0,
    elevation: 0,
  },
  signupButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  loginLink: {
    alignItems: 'center',
    marginTop: 16,
  },
  loginLinkText: {
    fontSize: 14,
    color: colors.secondary,
    fontWeight: '500',
  },
});

interface FormErrors {
  username?: string;
  password?: string;
  nickname?: string;
  email?: string;
}

export function SignupScreen({ navigation }: any) {
  const colors = useTheme();
  const { signup } = useAppStore();

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    nickname: '',
    email: '',
  });
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});

  // 유효성 검사 함수들
  const validateUsername = (username: string) => {
    if (!username.trim()) return '아이디를 입력해주세요.';
    if (username.length < 4) return '아이디는 4글자 이상이어야 합니다.';
    if (!/^[a-zA-Z0-9_]+$/.test(username)) return '영문, 숫자, 언더스코어만 사용 가능합니다.';
    return '';
  };

  const validatePassword = (password: string) => {
    if (!password) return '비밀번호를 입력해주세요.';
    if (password.length < 8) return '비밀번호는 8글자 이상이어야 합니다.';
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return '영문 대소문자와 숫자를 포함해야 합니다.';
    }
    return '';
  };

  const validateNickname = (nickname: string) => {
    if (!nickname.trim()) return '닉네임을 입력해주세요.';
    if (nickname.length < 2) return '닉네임은 2글자 이상이어야 합니다.';
    return '';
  };

  const validateEmail = (email: string) => {
    if (!email.trim()) return '이메일을 입력해주세요.';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return '올바른 이메일 형식이 아닙니다.';
    return '';
  };

  // 비밀번호 강도 계산
  const getPasswordStrength = (password: string) => {
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[!@#$%^&*]/.test(password)) score += 1;

    const strengths = ['매우 약함', '약함', '보통', '강함', '매우 강함'];
    const colors = ['#FF6B6B', '#FF8E53', '#FFD93D', '#6BCF7F', '#4ECDC4'];

    return {
      score,
      text: strengths[score] || '매우 약함',
      color: colors[score] || '#FF6B6B',
      width: `${(score / 5) * 100}%`
    };
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // 실시간 유효성 검사
    let error = '';
    switch (field) {
      case 'username':
        error = validateUsername(value);
        break;
      case 'password':
        error = validatePassword(value);
        break;
      case 'nickname':
        error = validateNickname(value);
        break;
      case 'email':
        error = validateEmail(value);
        break;
    }

    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleSignup = async () => {
    // 전체 유효성 검사
    const newErrors: FormErrors = {
      username: validateUsername(formData.username),
      password: validatePassword(formData.password),
      nickname: validateNickname(formData.nickname),
      email: validateEmail(formData.email),
    };

    // 비밀번호 확인
    if (formData.password !== formData.confirmPassword) {
      Alert.alert('알림', '비밀번호가 일치하지 않습니다.');
      return;
    }

    // 에러가 있는지 확인
    const hasErrors = Object.values(newErrors).some(error => error !== '');
    if (hasErrors) {
      setErrors(newErrors);
      Alert.alert('알림', '입력 정보를 확인해주세요.');
      return;
    }

    try {
      const success = await signup({
        username: formData.username,
        password: formData.password,
        nickname: formData.nickname,
        email: formData.email,
      });

      if (success) {
        Alert.alert(
          '회원가입 완료! 🎉',
          '환영합니다! 로그인 화면으로 이동합니다.',
          [
            { text: '확인', onPress: () => navigation.goBack() }
          ]
        );
      } else {
        Alert.alert('회원가입 실패', '이미 존재하는 아이디입니다.');
      }
    } catch (error) {
      Alert.alert('오류', '회원가입 중 문제가 발생했습니다.');
    }
  };

  const isFormValid = () => {
    return formData.username &&
      formData.password &&
      formData.confirmPassword &&
      formData.nickname &&
      formData.email &&
      formData.password === formData.confirmPassword &&
      Object.values(errors).every(error => !error);
  };

  const passwordStrength = getPasswordStrength(formData.password);
  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>회원가입</Text>
        </View>

        <CustomScrollView
          style={styles.scrollView}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            {/* 회원가입 폼 */}
            <View style={styles.formContainer}>
              <Text style={styles.formTitle}>새 계정 만들기</Text>
              <Text style={styles.formSubtitle}>
                커플 다이어리와 함께 특별한 순간들을 기록해보세요 💕
              </Text>

              {/* 아이디 입력 */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>
                  아이디 <Text style={styles.required}>*</Text>
                </Text>
                <View style={[
                  styles.inputWrapper,
                  focusedInput === 'username' && styles.inputFocused,
                  errors.username && styles.inputError
                ]}>
                  <Icon
                    name="person"
                    size={20}
                    color={focusedInput === 'username' ? colors.primary : '#666'}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="4글자 이상의 아이디"
                    placeholderTextColor="#B0B0B0"
                    value={formData.username}
                    onChangeText={(text) => handleInputChange('username', text)}
                    onFocus={() => setFocusedInput('username')}
                    onBlur={() => setFocusedInput(null)}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
                {errors.username ? <Text style={styles.errorText}>{errors.username}</Text> : null}
              </View>

              {/* 비밀번호 입력 */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>
                  비밀번호 <Text style={styles.required}>*</Text>
                </Text>
                <View style={[
                  styles.inputWrapper,
                  focusedInput === 'password' && styles.inputFocused,
                  errors.password && styles.inputError
                ]}>
                  <Icon
                    name="lock"
                    size={20}
                    color={focusedInput === 'password' ? colors.primary : '#666'}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="8글자 이상, 영문/숫자 포함"
                    placeholderTextColor="#B0B0B0"
                    value={formData.password}
                    onChangeText={(text) => handleInputChange('password', text)}
                    onFocus={() => setFocusedInput('password')}
                    onBlur={() => setFocusedInput(null)}
                    secureTextEntry
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
                {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}

                {/* 비밀번호 강도 표시 */}
                {formData.password ? (
                  <View style={styles.passwordStrength}>
                    <View style={styles.strengthBar}>
                      <View
                        style={[
                          styles.strengthFill,
                          {
                            backgroundColor: passwordStrength.color,
                            width: passwordStrength.width
                          }
                        ]}
                      />
                    </View>
                    <Text style={[styles.strengthText, { color: passwordStrength.color }]}>
                      {passwordStrength.text}
                    </Text>
                  </View>
                ) : null}
              </View>

              {/* 비밀번호 확인 */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>
                  비밀번호 확인 <Text style={styles.required}>*</Text>
                </Text>
                <View style={[
                  styles.inputWrapper,
                  focusedInput === 'confirmPassword' && styles.inputFocused,
                  formData.confirmPassword && formData.password !== formData.confirmPassword && styles.inputError
                ]}>
                  <Icon
                    name="lock-outline"
                    size={20}
                    color={focusedInput === 'confirmPassword' ? colors.primary : '#666'}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="비밀번호를 다시 입력하세요"
                    placeholderTextColor="#B0B0B0"
                    value={formData.confirmPassword}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, confirmPassword: text }))}
                    onFocus={() => setFocusedInput('confirmPassword')}
                    onBlur={() => setFocusedInput(null)}
                    secureTextEntry
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
                {formData.confirmPassword && formData.password !== formData.confirmPassword ? (
                  <Text style={styles.errorText}>비밀번호가 일치하지 않습니다.</Text>
                ) : null}
              </View>

              {/* 닉네임 입력 */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>
                  닉네임 <Text style={styles.required}>*</Text>
                </Text>
                <View style={[
                  styles.inputWrapper,
                  focusedInput === 'nickname' && styles.inputFocused,
                  errors.nickname && styles.inputError
                ]}>
                  <Icon
                    name="face"
                    size={20}
                    color={focusedInput === 'nickname' ? colors.primary : '#666'}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="사용할 닉네임을 입력하세요"
                    placeholderTextColor="#B0B0B0"
                    value={formData.nickname}
                    onChangeText={(text) => handleInputChange('nickname', text)}
                    onFocus={() => setFocusedInput('nickname')}
                    onBlur={() => setFocusedInput(null)}
                    autoCorrect={false}
                  />
                </View>
                {errors.nickname ? <Text style={styles.errorText}>{errors.nickname}</Text> : null}
              </View>

              {/* 이메일 입력 */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>
                  이메일 <Text style={styles.required}>*</Text>
                </Text>
                <View style={[
                  styles.inputWrapper,
                  focusedInput === 'email' && styles.inputFocused,
                  errors.email && styles.inputError
                ]}>
                  <Icon
                    name="email"
                    size={20}
                    color={focusedInput === 'email' ? colors.primary : '#666'}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="example@email.com"
                    placeholderTextColor="#B0B0B0"
                    value={formData.email}
                    onChangeText={(text) => handleInputChange('email', text)}
                    onFocus={() => setFocusedInput('email')}
                    onBlur={() => setFocusedInput(null)}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                  />
                </View>
                {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
              </View>

              {/* 회원가입 버튼 */}
              <TouchableOpacity
                style={[
                  styles.signupButton,
                  !isFormValid() && styles.signupButtonDisabled
                ]}
                onPress={handleSignup}
                disabled={!isFormValid()}
              >
                <Icon name="person-add" size={20} color="#fff" />
                <Text style={styles.signupButtonText}>계정 만들기</Text>
              </TouchableOpacity>

              {/* 로그인 링크 */}
              <TouchableOpacity
                style={styles.loginLink}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.loginLinkText}>이미 계정이 있으신가요? 로그인하기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </CustomScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
