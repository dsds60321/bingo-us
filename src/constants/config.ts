// 환경별 설정 관리
export const config = {
  development: {
    API_BASE_URL: 'http://192.168.0.30:10001/bingo-us/v1',
    API_TIMEOUT: 10000,
  },
  production: {
    API_BASE_URL: 'https://gunho.dev/bingo-us/v1',
    API_TIMEOUT: 15000,
  },
  staging: {
    API_BASE_URL: 'https://gunho.dev/bingo-us/v1',
    API_TIMEOUT: 10000,
  },
};

// 현재 환경에 따른 설정 선택
const currentEnv = __DEV__ ? 'development' : 'production';
export const API_CONFIG = config[currentEnv];

// API 엔드포인트 정의 (실제 서버 API에 맞춤)
export const API_ENDPOINTS = {
  // 인증 관련
  auth: {
    signIn: '/sign-in',
    signup: '/sign-up',
    logout: '/sign-out',
    verifyEmail: '/sign-up/email/verify',
    confirmEmail : '/sign-up/email/confirm',
  },

  // 기념일 관련
  anniversary: {
    list: '/anniversaries',
    create: '/anniversaries',
    update: '/anniversaries',
    delete: '/anniversaries',
  },

  // 일정/Todo 관련
  schedule: {
    list: '/todos',
    create: '/todos',
    update: '/todos',
    delete: '/todos',
  },

  // 대시보드 관련
  dashboard: {
    main: '/dashboard',
    stats: '/dashboard/stats',
  },

  // 커플 관련
  couple: {
    info: '/couple',
    invite: '/couple/invite',
    accept: '/couple/accept',
    link : '/couple/link'
  },

  // 가계부 관련
  budget: {
    list: '/budget-items',
    create: '/budget-items',
    update: '/budget',
    delete: '/budget',
  },

  // 반성문 관련
  reflection: {
    list: '/reflections',
    create: '/reflections',
    stats: '/reflections/stats',
    update: '/reflections',
    delete: '/reflections',
    detail: '/reflections/detail',
    byUser: '/reflections/user',
  },
  notification: {
    send: '/notifications/send',
    registerToken: '/notifications/fcm-token', // FCM 토큰 등록
  },

};
