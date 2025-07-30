// 환경별 설정 관리
export const config = {
  development: {
    API_BASE_URL: 'http://localhost:8080/bingo-us/v1',
    API_TIMEOUT: 10000,
  },
  production: {
    API_BASE_URL: 'https://your-production-api.com/api',
    API_TIMEOUT: 15000,
  },
  staging: {
    API_BASE_URL: 'https://your-staging-api.com/api',
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
    signup: '/signup',
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
  },

  // 가계부 관련
  budget: {
    list: '/budget-items',
    create: '/budget-items',
    update: '/budget',
    delete: '/budget',
  },
};
