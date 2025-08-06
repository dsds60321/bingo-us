import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../store/themeStore';
import { authService } from '../../services/AuthService';
import CustomScrollView from '../../components/CustomScrollView';

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
    marginRight: 40,
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
  // ✅ 초대 토큰 표시 스타일 추가
  inviteTokenContainer: {
    backgroundColor: colors.primary + '20',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary + '40',
  },
  inviteTokenTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  inviteTokenText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
    textAlign: 'center',
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
  inputVerified: {
    borderColor: '#4CAF50',
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
  emailInputWrapper: {
    flex: 1,
  },
  verifyButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginLeft: 8,
  },
  verifyButtonDisabled: {
    backgroundColor: '#CCC',
  },
  verifyButtonVerified: {
    backgroundColor: '#4CAF50',
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  verificationContainer: {
    marginTop: 8,
    padding: 12,
    backgroundColor: colors.surfaceVariant,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  verificationInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verificationInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginRight: 8,
  },
  verificationButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  verificationButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  verificationTimer: {
    fontSize: 12,
    color: colors.primary,
    textAlign: 'center',
    marginTop: 8,
  },
  verificationTimerExpired: {
    fontSize: 12,
    color: colors.error || '#FF6B6B',
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '600',
  },
  expiredMessage: {
    backgroundColor: '#FFE6E6',
    borderColor: colors.error || '#FF6B6B',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  expiredMessageText: {
    fontSize: 12,
    color: colors.error || '#FF6B6B',
    textAlign: 'center',
    fontWeight: '600',
  },
  resendButton: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 8,
    alignSelf: 'center',
  },
  resendButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  verificationSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  verificationSuccessText: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  errorText: {
    fontSize: 12,
    color: colors.error || '#FF6B6B',
    marginTop: 4,
    marginLeft: 8,
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
  loadingButton: {
    opacity: 0.6,
  },
});

interface FormErrors {
  id?: string;
  password?: string;
  nickname?: string;
  email?: string;
}

export function SignupScreen({ navigation, route }: any) {
  const colors = useTheme();

  // ✅ route에서 token 파라미터 받기
  const inviteToken = route?.params?.token || null;

  const [formData, setFormData] = useState({
    id: '',
    password: '',
    confirmPassword: '',
    nickname: '',
    email: '',
  });
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  // 이메일 인증 관련 상태 - 수정된 부분
  const [emailVerification, setEmailVerification] = useState({
    isVerifying: false,
    isVerified: false,
    verificationCode: '',
    timer: 0,
    canResend: true,
    isExpired: false, // ✅ 만료 상태 추가
  });

  // 타이머 참조 - ✅ useRef로 타이머 관리
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // ✅ 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // ✅ 초대 토큰이 있을 때 UI 변경
  useEffect(() => {
    if (inviteToken) {
      console.log('초대 토큰 감지:', inviteToken);
      // 초대받은 사용자임을 알리는 메시지 표시
      Alert.alert(
        '커플 초대 🎉',
        '파트너가 당신을 커플 다이어리에 초대했습니다!\n회원가입을 완료하면 자동으로 커플이 연결됩니다.',
        [{ text: '확인' }]
      );
    }
  }, [inviteToken]);

  // 유효성 검사 함수들
  const validateUsername = (id: string) => {
    if (!id.trim()) return '아이디를 입력해주세요.';
    if (id.length < 4) return '아이디는 4글자 이상이어야 합니다.';
    if (!/^[a-zA-Z0-9_]+$/.test(id)) return '영문, 숫자, 언더스코어만 사용 가능합니다.';
    return '';
  };

  const validatePassword = (password: string) => {
    if (!password) return '비밀번호를 입력해주세요.';
    if (password.length < 8) return '비밀번호는 8글자 이상이어야 합니다.';
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

  // ✅ 타이머 시작 함수
  const startTimer = () => {
    // 기존 타이머가 있다면 정리
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      setEmailVerification(prev => {
        if (prev.timer <= 1) {
          clearInterval(timerRef.current!);
          // ✅ 타이머 만료 시 처리
          return {
            ...prev,
            timer: 0,
            canResend: true,
            isExpired: true, // 만료 상태로 변경
            isVerifying: false, // 인증 상태 해제
            verificationCode: '' // 입력된 코드 초기화
          };
        }
        return { ...prev, timer: prev.timer - 1 };
      });
    }, 1000);
  };

  // ✅ 이메일 인증 코드 발송 - 수정된 부분
  const sendVerificationCode = async () => {
    const emailError = validateEmail(formData.email);
    if (emailError) {
      setErrors(prev => ({ ...prev, email: emailError }));
      return;
    }

    // 아이디가 입력되지 않은 경우 체크
    if (!formData.id.trim()) {
      setErrors(prev => ({ ...prev, id: '아이디를 먼저 입력해주세요.' }));
      return;
    }

    setIsLoading(true);
    try {
      console.log('Sending verification code...');
      const response = await authService.verifyEmail(formData.id, formData.email);
      console.log('Verification response:', response);

      if (response.success) {
        // ✅ 인증 상태 초기화 및 타이머 시작
        setEmailVerification(prev => ({
          ...prev,
          isVerifying: true,
          isVerified: false,
          isExpired: false, // 만료 상태 초기화
          verificationCode: '',
          timer: 300, // 5분 (300초)
          canResend: false,
        }));

        Alert.alert('인증 코드 발송', `인증 코드를 ${formData.email}로 발송했습니다.\n5분 내에 인증을 완료해주세요.`);

        // ✅ 타이머 시작
        startTimer();
      } else {
        Alert.alert('발송 실패', response.message || '인증 코드 발송에 실패했습니다.');
      }
    } catch (error) {
      console.error('Verification error:', error);
      Alert.alert('오류', '인증 코드 발송 중 문제가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ 인증 코드 확인 - 수정된 부분
  const verifyCode = async () => {
    if (!emailVerification.verificationCode.trim()) {
      Alert.alert('알림', '인증 코드를 입력해주세요.');
      return;
    }

    // ✅ 만료된 경우 체크
    if (emailVerification.isExpired || emailVerification.timer <= 0) {
      Alert.alert('인증 만료', '인증 시간이 만료되었습니다. 인증 코드를 다시 발송해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.confirmEmail(
        formData.email,
        emailVerification.verificationCode
      );

      console.log('verify ', response);
      if (response.data.verified) {
        // ✅ 인증 성공 시 타이머 정리
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }

        setEmailVerification(prev => ({
          ...prev,
          isVerified: true,
          isVerifying: false,
          isExpired: false,
          timer: 0,
        }));
        Alert.alert('인증 완료', '이메일 인증이 완료되었습니다! ✅');
      } else {
        Alert.alert('인증 실패', response.data.message || '인증 코드가 올바르지 않습니다.');
      }
    } catch (error) {
      Alert.alert('오류', '인증 확인 중 문제가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ 재발송 함수 추가
  const resendVerificationCode = async () => {
    // 기존 상태 초기화
    setEmailVerification(prev => ({
      ...prev,
      isExpired: false,
      verificationCode: '',
      timer: 0,
      canResend: false,
    }));

    // 재발송
    await sendVerificationCode();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // ✅ 이메일이 변경되면 인증 상태 초기화 및 타이머 정리
    if (field === 'email') {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      setEmailVerification(prev => ({
        ...prev,
        isVerifying: false,
        isVerified: false,
        isExpired: false,
        verificationCode: '',
        timer: 0,
        canResend: true,
      }));
    }

    // 실시간 유효성 검사
    let error = '';
    switch (field) {
      case 'id':
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

  // ✅ 회원가입 함수 수정 - token 포함
  const handleSignup = async () => {
    // 전체 유효성 검사
    const newErrors: FormErrors = {
      id: validateUsername(formData.id),
      password: validatePassword(formData.password),
      nickname: validateNickname(formData.nickname),
      email: validateEmail(formData.email),
    };

    // 비밀번호 확인
    if (formData.password !== formData.confirmPassword) {
      Alert.alert('알림', '비밀번호가 일치하지 않습니다.');
      return;
    }

    // 이메일 인증 확인
    if (!emailVerification.isVerified) {
      Alert.alert('알림', '이메일 인증을 완료해주세요.');
      return;
    }

    // 에러가 있는지 확인
    const hasErrors = Object.values(newErrors).some(error => error !== '');
    if (hasErrors) {
      setErrors(newErrors);
      Alert.alert('알림', '입력 정보를 확인해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      // ✅ 초대 토큰 포함한 회원가입 데이터
      const signupData = {
        id: formData.id,
        password: formData.password,
        nickname: formData.nickname,
        email: formData.email,
        ...(inviteToken && { token: inviteToken }), // 토큰이 있으면 포함
      };

      console.log('회원가입 데이터:', {
        ...signupData,
        password: '[숨김]' // 로그에서 비밀번호 숨김
      });

      const response = await authService.signUp(signupData);

      if (response.success) {
        const successMessage = inviteToken
          ? '회원가입 완료! 🎉\n커플이 자동으로 연결되었습니다!\n로그인하여 파트너와 함께 추억을 만들어보세요.'
          : '회원가입 완료! 🎉\n환영합니다! 로그인 화면으로 이동합니다.';

        Alert.alert(
          '가입 성공',
          successMessage,
          [
            { text: '확인', onPress: () => navigation.navigate('Login')}
          ]
        );
      } else {
        Alert.alert('회원가입 실패', response.message || '회원가입에 실패했습니다.');
      }
    } catch (error) {
      Alert.alert('오류', '회원가입 중 문제가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = () => {
    return formData.id &&
      formData.password &&
      formData.confirmPassword &&
      formData.nickname &&
      formData.email &&
      formData.password === formData.confirmPassword &&
      emailVerification.isVerified &&
      Object.values(errors).every(error => !error);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Icon name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {inviteToken ? '커플 초대받기' : '회원가입'}
        </Text>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <CustomScrollView
          style={styles.scrollView}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View style={styles.content}>
            {/* 회원가입 폼 */}
            <View style={styles.formContainer}>
              <Text style={styles.formTitle}>
                {inviteToken ? '파트너와 함께 시작하기' : '새 계정 만들기'}
              </Text>
              <Text style={styles.formSubtitle}>
                {inviteToken
                  ? '회원가입을 완료하면 자동으로 커플이 연결됩니다 💕'
                  : '커플 다이어리와 함께 특별한 순간들을 기록해보세요 💕'
                }
              </Text>

              {/* ✅ 초대 토큰 표시 */}
              {inviteToken && (
                <View style={styles.inviteTokenContainer}>
                  <Icon name="favorite" size={32} color={colors.primary} />
                  <Text style={styles.inviteTokenTitle}>
                    🎉 커플 초대 링크로 가입하기
                  </Text>
                  <Text style={styles.inviteTokenText}>
                    초대 코드: {inviteToken.slice(0, 8)}...
                  </Text>
                </View>
              )}

              {/* 아이디 입력 */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>
                  아이디 <Text style={styles.required}>*</Text>
                </Text>
                <View style={[
                  styles.inputWrapper,
                  focusedInput === 'id' && styles.inputFocused,
                  errors.id && styles.inputError
                ]}>
                  <Icon
                    name="person"
                    size={20}
                    color={focusedInput === 'id' ? colors.primary : '#666'}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="4글자 이상의 아이디"
                    placeholderTextColor="#B0B0B0"
                    value={formData.id}
                    onChangeText={(text) => handleInputChange('id', text)}
                    onFocus={() => setFocusedInput('id')}
                    onBlur={() => setFocusedInput(null)}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isLoading}
                    returnKeyType="next"
                    blurOnSubmit={false}
                  />
                </View>
                {errors.id ? <Text style={styles.errorText}>{errors.id}</Text> : null}
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
                    placeholder="8글자 이상의 비밀번호"
                    placeholderTextColor="#B0B0B0"
                    value={formData.password}
                    onChangeText={(text) => handleInputChange('password', text)}
                    onFocus={() => setFocusedInput('password')}
                    onBlur={() => setFocusedInput(null)}
                    secureTextEntry
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isLoading}
                    returnKeyType="next"
                    blurOnSubmit={false}
                  />
                </View>
                {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
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
                    editable={!isLoading}
                    returnKeyType="next"
                    blurOnSubmit={false}
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
                    editable={!isLoading}
                    returnKeyType="next"
                    blurOnSubmit={false}
                  />
                </View>
                {errors.nickname ? <Text style={styles.errorText}>{errors.nickname}</Text> : null}
              </View>

              {/* 이메일 입력 및 인증 */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>
                  이메일 <Text style={styles.required}>*</Text>
                </Text>
                <View style={[
                  styles.inputWrapper,
                  focusedInput === 'email' && styles.inputFocused,
                  errors.email && styles.inputError,
                  emailVerification.isVerified && styles.inputVerified
                ]}>
                  <Icon
                    name="email"
                    size={20}
                    color={
                      emailVerification.isVerified ? '#4CAF50' :
                        focusedInput === 'email' ? colors.primary : '#666'
                    }
                    style={styles.inputIcon}
                  />
                  <View style={styles.emailInputWrapper}>
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
                      editable={!emailVerification.isVerified && !isLoading}
                      returnKeyType="done"
                      blurOnSubmit={false}
                    />
                  </View>
                  {!emailVerification.isVerified && (
                    <TouchableOpacity
                      style={[
                        styles.verifyButton,
                        isLoading && styles.loadingButton,
                        (!formData.email || errors.email || !emailVerification.canResend) && styles.verifyButtonDisabled
                      ]}
                      onPress={sendVerificationCode}
                      disabled={!formData.email || !!errors.email || !emailVerification.canResend || isLoading}
                    >
                      <Text style={styles.verifyButtonText}>
                        {isLoading ? '발송중...' : emailVerification.isVerifying ? '재발송' : '인증'}
                      </Text>
                    </TouchableOpacity>
                  )}
                  {emailVerification.isVerified && (
                    <View style={styles.verifyButtonVerified}>
                      <Icon name="check" size={16} color="#fff" />
                    </View>
                  )}
                </View>
                {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}

                {/* ✅ 인증 코드 입력 - 만료 처리 추가 */}
                {emailVerification.isVerifying && !emailVerification.isVerified && !emailVerification.isExpired && (
                  <View style={styles.verificationContainer}>
                    <Text style={[styles.label, { marginBottom: 8 }]}>인증 코드</Text>
                    <View style={styles.verificationInputWrapper}>
                      <TextInput
                        style={styles.verificationInput}
                        placeholder="6자리 인증 코드"
                        placeholderTextColor="#B0B0B0"
                        value={emailVerification.verificationCode}
                        onChangeText={(text) => setEmailVerification(prev => ({ ...prev, verificationCode: text }))}
                        keyboardType="number-pad"
                        maxLength={6}
                        editable={!isLoading && !emailVerification.isExpired}
                        returnKeyType="done"
                        blurOnSubmit={false}
                      />
                      <TouchableOpacity
                        style={[
                          styles.verificationButton,
                          isLoading && styles.loadingButton
                        ]}
                        onPress={verifyCode}
                        disabled={isLoading || emailVerification.isExpired}
                      >
                        <Text style={styles.verificationButtonText}>
                          {isLoading ? '확인중...' : '확인'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                    {emailVerification.timer > 0 ? (
                      <Text style={[
                        styles.verificationTimer,
                        emailVerification.timer <= 60 && { color: colors.error || '#FF6B6B' }
                      ]}>
                        남은 시간: {formatTime(emailVerification.timer)}
                        {emailVerification.timer <= 60 && ' ⏰'}
                      </Text>
                    ) : null}
                  </View>
                )}

                {/* ✅ 만료 메시지 및 재발송 버튼 */}
                {emailVerification.isExpired && (
                  <View style={styles.expiredMessage}>
                    <Text style={styles.expiredMessageText}>
                      ⚠️ 인증 시간이 만료되었습니다. (5분 초과)
                    </Text>
                    <TouchableOpacity
                      style={[
                        styles.resendButton,
                        isLoading && styles.loadingButton
                      ]}
                      onPress={resendVerificationCode}
                      disabled={isLoading}
                    >
                      <Text style={styles.resendButtonText}>
                        {isLoading ? '재발송중...' : '인증 코드 재발송'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* 인증 성공 메시지 */}
                {emailVerification.isVerified && (
                  <View style={styles.verificationSuccess}>
                    <Icon name="check-circle" size={16} color="#4CAF50" />
                    <Text style={styles.verificationSuccessText}>
                      이메일 인증이 완료되었습니다!
                    </Text>
                  </View>
                )}
              </View>

              {/* 회원가입 버튼 */}
              <TouchableOpacity
                style={[
                  styles.signupButton,
                  (!isFormValid() || isLoading) && styles.signupButtonDisabled
                ]}
                onPress={handleSignup}
                disabled={!isFormValid() || isLoading}
              >
                <Icon name="person-add" size={20} color="#fff" />
                <Text style={styles.signupButtonText}>
                  {isLoading
                    ? '가입 중...'
                    : inviteToken
                      ? '커플 연결하며 가입하기'
                      : '회원가입'
                  }
                </Text>
              </TouchableOpacity>

              {/* 로그인 링크 */}
              <TouchableOpacity
                style={styles.loginLink}
                onPress={() => navigation.navigate('Login')}
              >
                <Text style={styles.loginLinkText}>
                  이미 계정이 있으신가요? 로그인하기
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </CustomScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
