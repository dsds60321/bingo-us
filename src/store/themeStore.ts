import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ThemeColors {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  secondaryLight: string;
  background: string;
  surface: string;
  surfaceVariant: string;
  accent1: string;
  accent2: string;
  shadow: string;
}

export interface Theme {
  id: string;
  name: string;
  emoji: string;
  colors: ThemeColors;
}

// 기본 테마 (DashboardScreen 스타일)
const defaultTheme: Theme = {
  id: 'default',
  name: '클래식 블루',
  emoji: '💙',
  colors: {
    primary: '#007AFF',
    primaryLight: '#5AC8FA',
    primaryDark: '#0051D0',
    secondary: '#28a745',
    secondaryLight: '#34CE57',
    background: '#f8f9fa',
    surface: '#FFFFFF',
    surfaceVariant: '#F5F5F5',
    accent1: '#28a745',
    accent2: '#ffc107',
    shadow: '#000000',
  },
};

// 핑크 테마 (CalendarScreen 스타일)
const pinkTheme: Theme = {
  id: 'pink',
  name: '러블리 핑크',
  emoji: '💕',
  colors: {
    primary: '#FF8A95',
    primaryLight: '#FFB6C1',
    primaryDark: '#FF6B7A',
    secondary: '#87CEEB',
    secondaryLight: '#98FB98',
    background: '#FFF5F7',
    surface: '#FFFFFF',
    surfaceVariant: '#FFF0F2',
    accent1: '#87CEEB',
    accent2: '#FFB6C1',
    shadow: '#FF8A95',
  },
};

// 보라 테마
const purpleTheme: Theme = {
  id: 'purple',
  name: '엘레간트 퍼플',
  emoji: '💜',
  colors: {
    primary: '#8B5CF6',
    primaryLight: '#A78BFA',
    primaryDark: '#7C3AED',
    secondary: '#EC4899',
    secondaryLight: '#F472B6',
    background: '#FAF7FF',
    surface: '#FFFFFF',
    surfaceVariant: '#F3F0FF',
    accent1: '#EC4899',
    accent2: '#06B6D4',
    shadow: '#8B5CF6',
  },
};

// 그린 테마
const greenTheme: Theme = {
  id: 'green',
  name: '네이처 그린',
  emoji: '💚',
  colors: {
    primary: '#10B981',
    primaryLight: '#34D399',
    primaryDark: '#059669',
    secondary: '#F59E0B',
    secondaryLight: '#FBBF24',
    background: '#F0FDF4',
    surface: '#FFFFFF',
    surfaceVariant: '#ECFDF5',
    accent1: '#F59E0B',
    accent2: '#8B5CF6',
    shadow: '#10B981',
  },
};

const availableThemes = [defaultTheme, pinkTheme, purpleTheme, greenTheme];

interface ThemeState {
  currentTheme: Theme;
  availableThemes: Theme[];
  setTheme: (themeId: string) => void;
  getThemeById: (themeId: string) => Theme | undefined;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      currentTheme: defaultTheme,
      availableThemes,

      setTheme: (themeId: string) => {
        const theme = availableThemes.find(t => t.id === themeId);
        if (theme) {
          set({ currentTheme: theme });
        }
      },

      getThemeById: (themeId: string) => {
        return availableThemes.find(t => t.id === themeId);
      },
    }),
    {
      name: 'theme-storage',
    }
  )
);

// 테마 hook
export const useTheme = () => {
  const { currentTheme } = useThemeStore();
  return currentTheme.colors;
};
