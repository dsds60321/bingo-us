import React from 'react';
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

export function SettingsScreen({ navigation }: any) {
  const colors = useTheme();
  const { currentTheme, availableThemes, setTheme } = useThemeStore();

  const handleThemeChange = (themeId: string) => {
    if (themeId === currentTheme.id) return;

    setTheme(themeId);
    Alert.alert(
      '테마 변경 완료! 🎨',
      '새로운 테마가 적용되었습니다.',
      [{ text: '확인' }]
    );
  };

  const settingsSections = [
    {
      title: '앱 설정',
      items: [
        {
          icon: 'palette',
          title: '테마 색상',
          subtitle: '앱의 전체 색상을 변경하세요',
          isThemeSection: true,
        },
        {
          icon: 'notifications',
          title: '알림 설정',
          subtitle: '기념일 및 일정 알림',
          onPress: () => Alert.alert('알림', '알림 설정 기능을 구현해주세요!'),
        },
        {
          icon: 'language',
          title: '언어 설정',
          subtitle: '한국어',
          onPress: () => Alert.alert('언어', '언어 설정 기능을 구현해주세요!'),
        },
      ],
    },
    {
      title: '데이터',
      items: [
        {
          icon: 'backup',
          title: '데이터 백업',
          subtitle: '클라우드에 데이터 저장',
          onPress: () => Alert.alert('백업', '백업 기능을 구현해주세요!'),
        },
        {
          icon: 'sync',
          title: '동기화',
          subtitle: '파트너와 데이터 동기화',
          onPress: () => Alert.alert('동기화', '동기화 기능을 구현해주세요!'),
        },
      ],
    },
    {
      title: '계정',
      items: [
        {
          icon: 'person',
          title: '프로필 설정',
          subtitle: '이름, 사진 변경',
          onPress: () => Alert.alert('프로필', '프로필 설정을 구현해주세요!'),
        },
        {
          icon: 'security',
          title: '보안 설정',
          subtitle: '비밀번호, 생체인증',
          onPress: () => Alert.alert('보안', '보안 설정을 구현해주세요!'),
        },
        {
          icon: 'logout',
          title: '로그아웃',
          subtitle: '계정에서 로그아웃',
          onPress: () => Alert.alert('로그아웃', '로그아웃 기능을 구현해주세요!'),
          isDestructive: true,
        },
      ],
    },
    {
      title: '지원',
      items: [
        {
          icon: 'help',
          title: '도움말',
          subtitle: '사용법 및 FAQ',
          onPress: () => Alert.alert('도움말', '도움말을 구현해주세요!'),
        },
        {
          icon: 'feedback',
          title: '피드백 보내기',
          subtitle: '개선사항이나 버그 신고',
          onPress: () => Alert.alert('피드백', '피드백 기능을 구현해주세요!'),
        },
        {
          icon: 'info',
          title: '앱 정보',
          subtitle: '버전 1.0.0',
          onPress: () => Alert.alert('앱 정보', '커플 다이어리 v1.0.0\n\n사랑하는 두 사람을 위한 특별한 공간 💕'),
        },
      ],
    },
  ];

  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={styles.title}>⚙️ 설정</Text>
          <Text style={styles.subtitle}>앱을 나만의 스타일로 꾸며보세요</Text>
        </View>

        {/* 설정 섹션들 */}
        {settingsSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>

            <View style={styles.sectionContent}>
              {section.items.map((item, itemIndex) => (
                <View key={itemIndex}>
                  {item.isThemeSection ? (
                    // 테마 선택 섹션
                    <View>
                      <View style={styles.settingItem}>
                        <View style={styles.settingLeft}>
                          <View style={[styles.iconContainer, { backgroundColor: colors.surfaceVariant }]}>
                            <Icon name={item.icon} size={24} color={colors.primary} />
                          </View>
                          <View style={styles.settingContent}>
                            <Text style={styles.settingTitle}>{item.title}</Text>
                            <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
                          </View>
                        </View>
                      </View>

                      {/* 테마 선택 옵션들 */}
                      <View style={styles.themeContainer}>
                        {availableThemes.map((theme) => (
                          <TouchableOpacity
                            key={theme.id}
                            style={[
                              styles.themeOption,
                              {
                                borderColor: currentTheme.id === theme.id ? colors.primary : colors.surfaceVariant,
                                backgroundColor: currentTheme.id === theme.id ? colors.surfaceVariant : colors.surface,
                              }
                            ]}
                            onPress={() => handleThemeChange(theme.id)}
                          >
                            <View style={styles.themeHeader}>
                              <Text style={styles.themeEmoji}>{theme.emoji}</Text>
                              <Text style={[
                                styles.themeName,
                                { color: currentTheme.id === theme.id ? colors.primary : '#666' }
                              ]}>
                                {theme.name}
                              </Text>
                              {currentTheme.id === theme.id && (
                                <Icon name="check-circle" size={20} color={colors.primary} />
                              )}
                            </View>

                            <View style={styles.themePreview}>
                              <View style={[styles.previewColor, { backgroundColor: theme.colors.primary }]} />
                              <View style={[styles.previewColor, { backgroundColor: theme.colors.secondary }]} />
                              <View style={[styles.previewColor, { backgroundColor: theme.colors.accent1 }]} />
                              <View style={[styles.previewColor, { backgroundColor: theme.colors.accent2 }]} />
                            </View>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  ) : (
                    // 일반 설정 아이템
                    <TouchableOpacity
                      style={[
                        styles.settingItem,
                        itemIndex === section.items.length - 1 && styles.lastItem
                      ]}
                      onPress={item.onPress}
                    >
                      <View style={styles.settingLeft}>
                        <View style={[
                          styles.iconContainer,
                          { backgroundColor: item.isDestructive ? '#FFEBEE' : colors.surfaceVariant }
                        ]}>
                          <Icon
                            name={item.icon}
                            size={24}
                            color={item.isDestructive ? '#F44336' : colors.primary}
                          />
                        </View>
                        <View style={styles.settingContent}>
                          <Text style={[
                            styles.settingTitle,
                            { color: item.isDestructive ? '#F44336' : '#333' }
                          ]}>
                            {item.title}
                          </Text>
                          <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
                        </View>
                      </View>
                      <Icon name="chevron-right" size={20} color="#B0B0B0" />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* 현재 테마 정보 */}
        <View style={styles.currentThemeInfo}>
          <Text style={styles.currentThemeTitle}>현재 테마</Text>
          <View style={styles.currentThemeCard}>
            <Text style={styles.currentThemeEmoji}>{currentTheme.emoji}</Text>
            <Text style={styles.currentThemeName}>{currentTheme.name}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 24,
    paddingTop: 60,
    backgroundColor: colors.surface,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
    marginLeft: 4,
  },
  sectionContent: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceVariant,
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  themeContainer: {
    padding: 16,
    gap: 12,
  },
  themeOption: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  themeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  themeEmoji: {
    fontSize: 24,
  },
  themeName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  themePreview: {
    flexDirection: 'row',
    gap: 8,
  },
  previewColor: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  currentThemeInfo: {
    padding: 20,
    alignItems: 'center',
    marginBottom: 40,
  },
  currentThemeTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  currentThemeCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  currentThemeEmoji: {
    fontSize: 32,
  },
  currentThemeName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
});
