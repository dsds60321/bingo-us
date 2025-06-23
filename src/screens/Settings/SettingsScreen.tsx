import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useThemeStore, useTheme } from '../../store/themeStore';
import { useAppStore } from '../../store/appStore';
import { CustomScrollView } from '../../components/CustomScrollView.tsx';

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.surface,
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingTop: 60,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.primary,
    textAlign: 'center',
  },
  content: {
    padding: 20,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
    padding: 20,
    paddingBottom: 0,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceVariant,
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  menuIcon: {
    marginRight: 16,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  logoutButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  userInfo: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    alignSelf: 'center',
  },
  avatarText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '700',
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  // 🎨 테마 선택 관련 스타일 추가
  themeDropdown: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: 12,
    margin: 16,
    overflow: 'hidden',
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceVariant + '50',
  },
  lastThemeOption: {
    borderBottomWidth: 0,
  },
  selectedThemeOption: {
    backgroundColor: colors.primary + '15',
  },
  themeOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  themeEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  themeInfo: {
    flex: 1,
  },
  themeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  selectedThemeName: {
    color: colors.primary,
  },
  themePreview: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 4,
  },
  previewColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  currentThemeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  currentThemeName: {
    fontSize: 14,
    color: '#666',
  },
});

export function SettingsScreen() {
  const colors = useTheme();
  const { user, logout } = useAppStore();
  const { currentTheme, availableThemes, setTheme } = useThemeStore();
  const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false);

  const handleThemeChange = (themeId: string) => {
    if (themeId === currentTheme.id) {
      setIsThemeDropdownOpen(false);
      return;
    }

    setTheme(themeId);
    setIsThemeDropdownOpen(false);

    Alert.alert(
      '테마 변경 완료! 🎨',
      '새로운 테마가 적용되었습니다.',
      [{ text: '확인' }]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      '로그아웃',
      '정말 로그아웃 하시겠습니까?',
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '로그아웃',
          style: 'destructive',
          onPress: () => {
            logout();
          },
        },
      ]
    );
  };

  const menuItems = [
    {
      icon: 'person',
      title: '프로필 수정',
      onPress: () => console.log('프로필 수정'),
    },
    {
      icon: 'notifications',
      title: '알림 설정',
      onPress: () => console.log('알림 설정'),
    },
    {
      icon: 'palette',
      title: '테마 설정',
      isThemeItem: true,
      onPress: () => setIsThemeDropdownOpen(!isThemeDropdownOpen),
    },
    {
      icon: 'security',
      title: '보안 설정',
      onPress: () => console.log('보안 설정'),
    },
    {
      icon: 'help',
      title: '도움말',
      onPress: () => console.log('도움말'),
    },
    {
      icon: 'info',
      title: '앱 정보',
      onPress: () => Alert.alert('앱 정보', '커플 다이어리 v1.0.0\n\n사랑하는 두 사람을 위한 특별한 공간 💕'),
    },
  ];

  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.title}>⚙️ 설정</Text>
      </View>

      <CustomScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 사용자 정보 */}
        {user && (
          <View style={styles.userInfo}>
            <View style={styles.userAvatar}>
              <Text style={styles.avatarText}>
                {user.name.charAt(0)}
              </Text>
            </View>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
          </View>
        )}

        {/* 설정 메뉴 */}
        <View style={styles.section}>
          {menuItems.map((item, index) => (
            <View key={index}>
              <TouchableOpacity
                style={[
                  styles.menuItem,
                  !item.isThemeItem && index === menuItems.length - 1 && styles.lastMenuItem,
                  item.isThemeItem && isThemeDropdownOpen && { borderBottomWidth: 0 },
                ]}
                onPress={item.onPress}
              >
                <Icon
                  name={item.icon}
                  size={24}
                  color={colors.primary}
                  style={styles.menuIcon}
                />
                <Text style={styles.menuText}>{item.title}</Text>

                {/* 테마 설정일 때 현재 테마 정보 표시 */}
                {item.isThemeItem && (
                  <View style={styles.currentThemeInfo}>
                    <Text style={styles.themeEmoji}>{currentTheme.emoji}</Text>
                    <Text style={styles.currentThemeName}>{currentTheme.name}</Text>
                  </View>
                )}

                <Icon
                  name={item.isThemeItem && isThemeDropdownOpen ? "expand-less" : "chevron-right"}
                  size={20}
                  color="#ccc"
                />
              </TouchableOpacity>

              {/* 🎨 테마 드롭다운 */}
              {item.isThemeItem && isThemeDropdownOpen && (
                <View style={styles.themeDropdown}>
                  {availableThemes.map((theme, themeIndex) => (
                    <TouchableOpacity
                      key={theme.id}
                      style={[
                        styles.themeOption,
                        themeIndex === availableThemes.length - 1 && styles.lastThemeOption,
                        currentTheme.id === theme.id && styles.selectedThemeOption,
                      ]}
                      onPress={() => handleThemeChange(theme.id)}
                    >
                      <View style={styles.themeOptionLeft}>
                        <Text style={styles.themeEmoji}>{theme.emoji}</Text>
                        <View style={styles.themeInfo}>
                          <Text style={[
                            styles.themeName,
                            currentTheme.id === theme.id && styles.selectedThemeName
                          ]}>
                            {theme.name}
                          </Text>
                          <View style={styles.themePreview}>
                            <View style={[styles.previewColor, { backgroundColor: theme.colors.primary }]} />
                            <View style={[styles.previewColor, { backgroundColor: theme.colors.secondary }]} />
                            <View style={[styles.previewColor, { backgroundColor: theme.colors.accent1 }]} />
                            <View style={[styles.previewColor, { backgroundColor: theme.colors.accent2 }]} />
                          </View>
                        </View>
                      </View>
                      {currentTheme.id === theme.id && (
                        <Icon name="check-circle" size={20} color={colors.primary} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          ))}

          {/* 마지막 아이템이 테마가 아닐 때를 위한 처리 */}
          {!menuItems[menuItems.length - 1].isThemeItem && (
            <View style={styles.lastMenuItem} />
          )}
        </View>

        {/* 로그아웃 버튼 */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Icon name="logout" size={20} color="#fff" />
          <Text style={styles.logoutButtonText}>로그아웃</Text>
        </TouchableOpacity>
      </CustomScrollView>
    </SafeAreaView>
  );
}
