import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Linking,
  Platform,
  Share,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../store/themeStore';
import { coupleService } from '../../services/CoupleService';
import { useAppStore } from '../../store/appStore';

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
    flex: 1,
    padding: 20,
  },
  inviteCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 20,
  },
  inviteIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  inviteTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 12,
  },
  inviteDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  generateButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    minWidth: 200,
  },
  generateButtonDisabled: {
    backgroundColor: '#CCC',
    shadowOpacity: 0,
    elevation: 0,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  linkContainer: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  linkTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  linkText: {
    fontSize: 14,
    color: '#666',
    backgroundColor: colors.surfaceVariant,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    textAlign: 'center',
  },
  shareButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  shareButton: {
    flex: 1,
    backgroundColor: colors.secondary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  smsButton: {
    backgroundColor: '#25D366', // WhatsApp/SMS 색상
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  instructionCard: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: 16,
    padding: 20,
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  instructionStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  stepNumber: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export function CoupleInviteScreen({ navigation }: any) {
  const colors = useTheme();
  const { user } = useAppStore();
  const [isLoading, setIsLoading] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);

  const styles = createStyles(colors);

  // 초대 링크 생성
  const generateInviteLink = async () => {
    setIsLoading(true);
    try {
      const response = await coupleService.generateInviteLink();

      if (response.success && response.data) {
        setInviteLink(response.data);
        Alert.alert('링크 생성 완료', '초대 링크가 생성되었습니다! SMS로 공유해보세요.');
      } else {
        Alert.alert('오류', response.message || '초대 링크 생성에 실패했습니다.');
      }
    } catch (error) {
      console.error('Generate link error:', error);
      Alert.alert('오류', '초대 링크 생성 중 문제가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ SMS로 공유 - 백엔드에서 받은 앱 스킴 URL 그대로 사용
  const shareViaSMS = () => {
    if (!inviteLink) return;

    // ✅ 백엔드에서 받은 앱 스킴 URL을 그대로 사용
    const message = `💕 ${user?.name}님이 커플 다이어리에 초대했습니다!\n\n아래 링크를 클릭하여 함께 특별한 순간들을 기록해보세요:\n${inviteLink}\n\n#커플다이어리 #BingoUs`;

    const url = Platform.select({
      ios: `sms:&body=${encodeURIComponent(message)}`,
      android: `sms:?body=${encodeURIComponent(message)}`,
    });

    if (url) {
      Linking.openURL(url).catch(err => {
        console.error('SMS 앱 열기 실패:', err);
        Alert.alert('오류', 'SMS 앱을 열 수 없습니다.');
      });
    }
  };

  // ✅ 일반 공유 - 백엔드에서 받은 앱 스킴 URL 그대로 사용
  const shareLink = async () => {
    if (!inviteLink) return;

    // ✅ 백엔드에서 받은 앱 스킴 URL을 그대로 사용
    const message = `💕 ${user?.name}님이 커플 다이어리에 초대했습니다!\n\n아래 링크를 클릭하여 함께 특별한 순간들을 기록해보세요:\n${inviteLink}\n\n#커플다이어리 #BingoUs`;

    try {
      await Share.share({
        message: message,
        title: '커플 다이어리 초대',
      });
    } catch (error) {
      console.error('Share error:', error);
      Alert.alert('오류', '링크 공유 중 문제가 발생했습니다.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>커플 초대하기</Text>
      </View>

      <View style={styles.content}>
        {/* 초대 카드 */}
        <View style={styles.inviteCard}>
          <View style={styles.inviteIcon}>
            <Icon name="favorite" size={48} color={colors.primary} />
          </View>

          <Text style={styles.inviteTitle}>파트너 초대하기</Text>
          <Text style={styles.inviteDescription}>
            특별한 사람과 함께{'\n'}
            소중한 추억을 기록하고{'\n'}
            공유해보세요! 💕
          </Text>

          <TouchableOpacity
            style={[
              styles.generateButton,
              isLoading && styles.generateButtonDisabled
            ]}
            onPress={generateInviteLink}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Icon name="link" size={20} color="#fff" />
            )}
            <Text style={styles.generateButtonText}>
              {isLoading ? '생성 중...' : '초대 링크 생성하기'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 생성된 링크 */}
        {inviteLink && (
          <View style={styles.linkContainer}>
            <Text style={styles.linkTitle}>🎉 초대 링크가 생성되었습니다!</Text>

            {/* ✅ 백엔드에서 받은 앱 스킴 URL을 그대로 표시 */}
            <Text style={styles.linkText} numberOfLines={2}>
              {inviteLink}
            </Text>

            <View style={styles.shareButtonsContainer}>
              <TouchableOpacity
                style={[styles.shareButton, styles.smsButton]}
                onPress={shareViaSMS}
              >
                <Icon name="message" size={18} color="#fff" />
                <Text style={styles.shareButtonText}>SMS 전송</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.shareButton}
                onPress={shareLink}
              >
                <Icon name="share" size={18} color="#fff" />
                <Text style={styles.shareButtonText}>다른 방법</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* 사용 방법 안내 */}
        <View style={styles.instructionCard}>
          <View style={styles.instructionTitle}>
            <Icon name="info" size={20} color={colors.primary} style={{ marginRight: 8 }} />
            <Text style={styles.instructionTitle}>사용 방법</Text>
          </View>

          <View style={styles.instructionStep}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <Text style={styles.stepText}>
              '초대 링크 생성하기' 버튼을 클릭하여 링크를 만들어주세요
            </Text>
          </View>

          <View style={styles.instructionStep}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <Text style={styles.stepText}>
              'SMS 전송' 버튼을 클릭하여 파트너에게 초대 링크를 보내주세요
            </Text>
          </View>

          <View style={styles.instructionStep}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <Text style={styles.stepText}>
              파트너가 링크를 클릭하면 앱이 열리고 회원가입 화면으로 이동합니다
            </Text>
          </View>

          <View style={styles.instructionStep}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>4</Text>
            </View>
            <Text style={styles.stepText}>
              회원가입 완료 후 자동으로 커플 연결되어 함께 추억을 기록할 수 있습니다! 💕
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
