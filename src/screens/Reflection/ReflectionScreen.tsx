import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
  Animated,
  SafeAreaView,
} from 'react-native';
import { useTheme } from '../../store/themeStore';
import { useAppStore } from '../../store/appStore';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { format } from 'date-fns';
import { reflectionService, Reflection, CreateReflectionRequest } from '../../services/ReflectionService';

type TabType = 'list' | 'write';

export function ReflectionScreen() {
  const colors = useTheme();
  const { user, couple } = useAppStore();
  const [activeTab, setActiveTab] = useState<TabType>('list');
  const [selectedReflection, setSelectedReflection] = useState<Reflection | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isApprovalModalVisible, setIsApprovalModalVisible] = useState(false);
  const [isFeedbackModalVisible, setIsFeedbackModalVisible] = useState(false);
  const [pendingApproval, setPendingApproval] = useState<{id: number, approved: boolean} | null>(null);
  const [feedback, setFeedback] = useState('');
  const [approvalAnimValue] = useState(new Animated.Value(0));
  const [stampRotation] = useState(new Animated.Value(0));
  const [stampScale] = useState(new Animated.Value(0));
  const [isLoading, setIsLoading] = useState(false);

  // 반성문 작성 폼 상태
  const [incident, setIncident] = useState('');
  const [reason, setReason] = useState('');
  const [improvement, setImprovement] = useState('');

  // 반성문 목록 상태
  const [reflections, setReflections] = useState<Reflection[]>([]);

  // 🔥 반성문 목록 로드
  const loadReflections = useCallback(async () => {
    if (!couple?.id) {
      console.warn('Couple ID not found');
      return;
    }

    try {
      setIsLoading(true);
      const response = await reflectionService.getReflections();

      if (response.success && response.data?.length > 0) {
        setReflections(response.data);
      }

    } catch (error) {
      console.error('Error loading reflections:', error);
    } finally {
      setIsLoading(false);
    }
  }, [couple?.id]);

  useFocusEffect(
    useCallback(() => {
      console.log('🔄 ReflectionScreen focused - Loading reflections...');
      loadReflections();
    }, [loadReflections])
  );

  // 🔄 탭 변경 시에도 데이터 새로고침 (list 탭으로 전환할 때)
  useEffect(() => {
    if (activeTab === 'list') {
      console.log('🔄 Switched to list tab - Refreshing reflections...');
      loadReflections();
    }
  }, [activeTab, loadReflections]);

  // 반성문 제출
  const handleSubmit = async () => {
    if (!incident.trim() || !reason.trim() || !improvement.trim()) {
      Alert.alert('알림', '모든 항목을 입력해주세요.');
      return;
    }

    if (!user?.id || !couple?.id) {
      Alert.alert('오류', '사용자 정보가 없습니다.');
      return;
    }

    Alert.alert(
      '반성문 제출',
      '반성문을 제출하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '제출',
          onPress: async () => {
            try {
              setIsLoading(true);

              const reflectionData: CreateReflectionRequest = {
                couple_id: couple.id,
                author_user_id: user.id,
                approver_user_id: couple.users.find(data => data.id !== user.id)?.id,
                incident: incident.trim(),
                reason: reason.trim(),
                improvement: improvement.trim(),
              };

              const response = await reflectionService.createReflection(reflectionData);

              if (response.success) {
                Alert.alert('완료', '반성문이 제출되었습니다.');

                // 폼 초기화
                setIncident('');
                setReason('');
                setImprovement('');

                // 목록 새로고침
                await loadReflections();

                // 목록 탭으로 이동
                setActiveTab('list');
              } else {
                Alert.alert('오류', response.message || '반성문 제출에 실패했습니다.');
              }
            } catch (error) {
              console.error('Error submitting reflection:', error);
              Alert.alert('오류', '반성문 제출 중 오류가 발생했습니다.');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  // 결재 애니메이션 실행
  const startApprovalAnimation = () => {
    stampRotation.setValue(0);
    stampScale.setValue(0);
    approvalAnimValue.setValue(0);

    Animated.parallel([
      Animated.timing(stampRotation, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(stampScale, {
          toValue: 1.2,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(stampScale, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(approvalAnimValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // 결재 처리
  const handleApproval = async (reflectionId: number, approved: boolean, feedbackText?: string) => {
    if (!user?.id) {
      Alert.alert('오류', '사용자 정보가 없습니다.');
      return;
    }

    if (isDetailModalVisible) {
      setIsDetailModalVisible(false);
    }

    setPendingApproval({ id: reflectionId, approved });
    setIsApprovalModalVisible(true);

    setTimeout(() => {
      startApprovalAnimation();
    }, 100);

    try {
      const approvalData = {
        status: approved ? 'APPROVED' as const : 'REJECTED' as const,
        ...(feedbackText && { feedback: feedbackText }),
      };

      const response = await reflectionService.approveReflection(reflectionId, approvalData);

      setTimeout(async () => {
        setIsApprovalModalVisible(false);
        setPendingApproval(null);

        if (response.success) {
          await loadReflections();

          setTimeout(() => {
            Alert.alert(
              '결재 완료! ✅',
              approved
                ? '반성문이 승인되었습니다.\n상대방에게 알림이 전송됩니다.'
                : '반성문이 반려되었습니다.\n상대방에게 알림이 전송됩니다.',
              [{ text: '확인' }]
            );
          }, 200);
        } else {
          Alert.alert('오류', response.message || '결재 처리에 실패했습니다.');
        }
      }, 2200);
    } catch (error) {
      console.error('Error approving reflection:', error);

      setTimeout(() => {
        setIsApprovalModalVisible(false);
        setPendingApproval(null);
        Alert.alert('오류', '결재 처리 중 오류가 발생했습니다.');
      }, 2200);
    }
  };

  // 피드백 제출 처리
  const handleFeedbackSubmit = () => {
    if (!feedback.trim()) {
      Alert.alert('알림', '반려 사유를 입력해주세요.');
      return;
    }

    const reflection = reflections.find(r => r.id === pendingApproval?.id);
    if (!reflection) {
      Alert.alert('오류', '반성문을 찾을 수 없습니다.');
      return;
    }

    setIsFeedbackModalVisible(false);
    handleApproval(reflection.id, false, feedback);
    setFeedback('');
  };

  // 결재 확인
  const confirmApproval = (reflectionId: number, approved: boolean) => {
    const reflection = reflections.find(r => r.id === reflectionId);

    if (approved) {
      Alert.alert(
        `반성문 승인`,
        `"${reflection?.incident}"에 대한 반성문을 승인하시겠습니까?`,
        [
          { text: '취소', style: 'cancel' },
          {
            text: '승인',
            style: 'default',
            onPress: () => handleApproval(reflectionId, approved)
          }
        ]
      );
    } else {
      setPendingApproval({ id: reflectionId, approved: false });
      setIsFeedbackModalVisible(true);
    }
  };

  // 유틸리티 함수들
  const getCurrentDate = () => {
    const now = new Date();
    return `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일`;
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return '결재 대기';
      case 'APPROVED': return '승인됨';
      case 'REJECTED': return '반려됨';
      default: return '알 수 없음';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return '#F59E0B';
      case 'APPROVED': return '#10B981';
      case 'REJECTED': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'yyyy년 MM월 dd일 HH:mm');
  };

  const openReflectionDetail = (reflection: Reflection) => {
    setSelectedReflection(reflection);
    setIsDetailModalVisible(true);
  };

  const canApprove = (reflection: Reflection) => {
    return reflection.status === 'PENDING' && reflection.author_user_id !== user?.id;
  };

  const getAuthorName = (reflection: Reflection) => {
    return reflection.author_user_id === user?.id ? user?.name || '나' : '상대방님';
  };

  const getApproverName = (reflection: Reflection) => {
    if (!reflection.approver_user_id) return '';
    return reflection.approver_user_id === user?.id ? user?.name || '나' : '상대방님';
  };

  // 피드백 입력 모달
  const renderFeedbackModal = () => (
    <Modal
      visible={isFeedbackModalVisible}
      transparent
      animationType="slide"
      onRequestClose={() => setIsFeedbackModalVisible(false)}
    >
      <View style={styles.feedbackOverlay}>
        <View style={[styles.feedbackContainer, { backgroundColor: colors.surface }]}>
          <View style={styles.feedbackHeader}>
            <Text style={[styles.feedbackTitle, { color: colors.text }]}>
              반려 사유 입력
            </Text>
            <TouchableOpacity
              style={styles.feedbackCloseButton}
              onPress={() => setIsFeedbackModalVisible(false)}
            >
              <Icon name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.feedbackDescription, { color: colors.textSecondary }]}>
            반성문을 반려하는 이유를 상세히 작성해주세요.
            작성자가 이를 참고하여 더 나은 반성문을 작성할 수 있습니다.
          </Text>

          <TextInput
            style={[
              styles.feedbackTextInput,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            value={feedback}
            onChangeText={setFeedback}
            placeholder="반려 사유를 구체적으로 작성해주세요."
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />

          <View style={styles.feedbackButtons}>
            <TouchableOpacity
              style={[styles.feedbackButton, styles.feedbackCancelButton]}
              onPress={() => setIsFeedbackModalVisible(false)}
            >
              <Text style={styles.feedbackCancelButtonText}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.feedbackButton, styles.feedbackSubmitButton]}
              onPress={handleFeedbackSubmit}
            >
              <Icon name="send" size={16} color="#fff" />
              <Text style={styles.feedbackSubmitButtonText}>반려하기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderReflectionList = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      <View style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryNumber, { color: '#F59E0B' }]}>
              {reflections.filter(r => r.status === 'PENDING').length}
            </Text>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
              결재 대기
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryNumber, { color: '#10B981' }]}>
              {reflections.filter(r => r.status === 'APPROVED').length}
            </Text>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
              승인됨
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryNumber, { color: '#EF4444' }]}>
              {reflections.filter(r => r.status === 'REJECTED').length}
            </Text>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
              반려됨
            </Text>
          </View>
        </View>
      </View>

      {reflections.length === 0 ? (
        <View style={[styles.emptyState, { backgroundColor: colors.surface }]}>
          <Icon name="assignment" size={64} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            {isLoading ? '반성문을 불러오는 중...' : '작성된 반성문이 없습니다'}
          </Text>
          {!isLoading && (
            <TouchableOpacity
              style={[styles.writeButton, { backgroundColor: colors.primary }]}
              onPress={() => setActiveTab('write')}
            >
              <Icon name="edit" size={20} color="#fff" />
              <Text style={styles.writeButtonText}>반성문 작성하기</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <View style={styles.reflectionList}>
          {reflections.map((reflection) => (
            <TouchableOpacity
              key={reflection.id}
              style={[styles.reflectionCard, { backgroundColor: colors.surface }]}
              onPress={() => openReflectionDetail(reflection)}
            >
              <View style={styles.reflectionHeader}>
                <Text style={[styles.reflectionTitle, { color: colors.text }]} numberOfLines={2}>
                  {reflection.incident}
                </Text>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: `${getStatusColor(reflection.status)}20` }
                ]}>
                  <Text style={[
                    styles.statusText,
                    { color: getStatusColor(reflection.status) }
                  ]}>
                    {getStatusText(reflection.status)}
                  </Text>
                </View>
              </View>

              <View style={styles.reflectionInfo}>
                <Text style={[styles.reflectionDate, { color: colors.textSecondary }]}>
                  작성자: {getAuthorName(reflection)} • {formatDate(reflection.created_at)}
                </Text>

                {canApprove(reflection) && (
                  <View style={styles.approvalButtons}>
                    <TouchableOpacity
                      style={[styles.approvalButton, styles.approveButton]}
                      onPress={(e) => {
                        e.stopPropagation();
                        confirmApproval(reflection.id, true);
                      }}
                    >
                      <Icon name="check" size={16} color="#fff" />
                      <Text style={styles.approvalButtonText}>승인</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.approvalButton, styles.rejectButton]}
                      onPress={(e) => {
                        e.stopPropagation();
                        confirmApproval(reflection.id, false);
                      }}
                    >
                      <Icon name="close" size={16} color="#fff" />
                      <Text style={styles.approvalButtonText}>반려</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {/* 승인/반려 정보 및 피드백 표시 */}
              {reflection.status === 'APPROVED' && reflection.approved_at && (
                <View style={styles.approvalInfoContainer}>
                  <Text style={[styles.approvalInfoText, { color: '#10B981' }]}>
                    ✅ {getApproverName(reflection)}님이 {formatDate(reflection.approved_at)}에 승인
                  </Text>
                </View>
              )}

              {reflection.status === 'REJECTED' && (
                <View style={styles.rejectionContainer}>
                  <Text style={[styles.rejectionText, { color: '#EF4444' }]}>
                    ❌ {getApproverName(reflection)}님이 {reflection.approved_at ? formatDate(reflection.approved_at) : ''}에 반려
                  </Text>
                  {reflection.feedback && (
                    <View style={styles.feedbackPreviewContainer}>
                      <Text style={[styles.feedbackPreviewLabel, { color: '#EF4444' }]}>
                        반려 사유:
                      </Text>
                      <Text style={[styles.feedbackPreviewText, { color: colors.text }]} numberOfLines={2}>
                        {reflection.feedback}
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={{ height: 100 }} />
    </ScrollView>
  );

  const renderWriteForm = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      <View style={[styles.approvalSection, { backgroundColor: colors.surface }]}>
        <View style={styles.approvalHeader}>
          <View style={styles.approvalBox}>
            <Text style={[styles.approvalLabel, { color: colors.textSecondary }]}>
              결재자
            </Text>
            <View style={styles.approvalRightSection}>
              <View style={[styles.approverInfo, { borderColor: colors.border }]}>
                <Icon name="person" size={20} color={colors.textSecondary} />
                <Text style={[styles.approverName, { color: colors.text }]}>
                  상대방님
                </Text>
              </View>
              <View style={[styles.stampArea, { borderColor: colors.border }]}>
                <Text style={[styles.stampText, { color: colors.textSecondary }]}>
                  결재
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
              작성자:
            </Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {user?.name || '사용자'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
              작성일:
            </Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {getCurrentDate()}
            </Text>
          </View>
        </View>
      </View>

      <View style={[styles.formSection, { backgroundColor: colors.surface }]}>
        <View style={styles.formGroup}>
          <Text style={[styles.formLabel, { color: colors.text }]}>
            1. 잘못한 일 *
          </Text>
          <TextInput
            style={[
              styles.textInput,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            value={incident}
            onChangeText={setIncident}
            placeholder="어떤 잘못을 했는지 구체적으로 작성해주세요."
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={4}
            editable={!isLoading}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.formLabel, { color: colors.text }]}>
            2. 잘못한 이유 *
          </Text>
          <TextInput
            style={[
              styles.textInput,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            value={reason}
            onChangeText={setReason}
            placeholder="왜 그런 행동을 했는지 이유를 작성해주세요."
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={4}
            editable={!isLoading}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.formLabel, { color: colors.text }]}>
            3. 앞으로의 개선 방안 *
          </Text>
          <TextInput
            style={[
              styles.textInput,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            value={improvement}
            onChangeText={setImprovement}
            placeholder="같은 실수를 반복하지 않기 위한 구체적인 개선 방안을 작성해주세요."
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={5}
            editable={!isLoading}
          />
        </View>
      </View>

      <View style={[styles.signatureSection, { backgroundColor: colors.surface }]}>
        <View style={styles.signatureRow}>
          <Text style={[styles.signatureLabel, { color: colors.textSecondary }]}>
            작성자:
          </Text>
          <View style={[styles.signatureBox, { borderColor: colors.border }]}>
            <Text style={[styles.signatureName, { color: colors.text }]}>
              {user?.name || '사용자'}
            </Text>
            <Text style={[styles.signatureStamp, { color: colors.primary }]}>
              (인)
            </Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.submitButton,
          {
            backgroundColor: isLoading ? colors.textSecondary : colors.primary,
            opacity: isLoading ? 0.6 : 1
          }
        ]}
        onPress={handleSubmit}
        disabled={isLoading}
      >
        <Icon name="send" size={20} color="#fff" />
        <Text style={styles.submitButtonText}>
          {isLoading ? '제출 중...' : '반성문 제출'}
        </Text>
      </TouchableOpacity>

      <View style={{ height: 100 }} />
    </ScrollView>
  );

  // 결재 애니메이션 모달
  const renderApprovalAnimationModal = () => (
    <Modal
      visible={isApprovalModalVisible}
      transparent
      animationType="fade"
    >
      <View style={styles.animationOverlay}>
        <View style={styles.animationContainer}>
          <Animated.View
            style={[
              styles.stampContainer,
              {
                transform: [
                  {
                    rotate: stampRotation.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '360deg'],
                    }),
                  },
                  {
                    scale: stampScale,
                  },
                ],
                opacity: approvalAnimValue,
              },
            ]}
          >
            <View style={[
              styles.animatedStamp,
              {
                backgroundColor: pendingApproval?.approved ? '#10B981' : '#EF4444'
              }
            ]}>
              <Text style={styles.animatedStampText}>
                {pendingApproval?.approved ? '승인' : '반려'}
              </Text>
            </View>
          </Animated.View>

          <Animated.Text
            style={[
              styles.animationText,
              {
                opacity: approvalAnimValue,
                transform: [
                  {
                    translateY: approvalAnimValue.interpolate({
                      inputRange: [0, 1],
                      outputRange: [30, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            결재 완료!
          </Animated.Text>
        </View>
      </View>
    </Modal>
  );

  const renderDetailModal = () => (
    <Modal
      visible={isDetailModalVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setIsDetailModalVisible(false)}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.modalHeader, { backgroundColor: colors.surface }]}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setIsDetailModalVisible(false)}
          >
            <Icon name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.modalTitle, { color: colors.text }]}>
            반성문 상세보기
          </Text>
          <View style={styles.placeholder} />
        </View>

        {selectedReflection && (
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={[styles.detailCard, { backgroundColor: colors.surface }]}>
              <View style={styles.detailHeader}>
                <Text style={[styles.detailTitle, { color: colors.text }]}>
                  반성문
                </Text>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: `${getStatusColor(selectedReflection.status)}20` }
                ]}>
                  <Text style={[
                    styles.statusText,
                    { color: getStatusColor(selectedReflection.status) }
                  ]}>
                    {getStatusText(selectedReflection.status)}
                  </Text>
                </View>
              </View>

              <View style={styles.detailInfo}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                  작성자: {getAuthorName(selectedReflection)}
                </Text>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                  작성일: {formatDate(selectedReflection.created_at)}
                </Text>

                {selectedReflection.approved_at && (
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                    결재일: {formatDate(selectedReflection.approved_at)}
                  </Text>
                )}
              </View>

              <View style={styles.detailContent}>
                <View style={styles.detailSection}>
                  <Text style={[styles.detailSectionTitle, { color: colors.text }]}>
                    1. 잘못한 일
                  </Text>
                  <Text style={[styles.detailSectionContent, { color: colors.text }]}>
                    {selectedReflection.incident}
                  </Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={[styles.detailSectionTitle, { color: colors.text }]}>
                    2. 잘못한 이유
                  </Text>
                  <Text style={[styles.detailSectionContent, { color: colors.text }]}>
                    {selectedReflection.reason}
                  </Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={[styles.detailSectionTitle, { color: colors.text }]}>
                    3. 앞으로의 개선 방안
                  </Text>
                  <Text style={[styles.detailSectionContent, { color: colors.text }]}>
                    {selectedReflection.improvement}
                  </Text>
                </View>

                {/* 반려 피드백 표시 - 개선된 UI */}
                {selectedReflection.status === 'REJECTED' && selectedReflection.feedback && (
                  <View style={styles.detailFeedbackSection}>
                    <View style={styles.detailFeedbackHeader}>
                      <Icon name="feedback" size={20} color="#EF4444" />
                      <Text style={[styles.detailFeedbackTitle, { color: '#EF4444' }]}>
                        반려 사유
                      </Text>
                    </View>
                    <View style={styles.detailFeedbackContent}>
                      <Text style={[styles.detailFeedbackText, { color: colors.text }]}>
                        {selectedReflection.feedback}
                      </Text>
                    </View>
                  </View>
                )}
              </View>

              {canApprove(selectedReflection) && (
                <View style={styles.detailApprovalButtons}>
                  <TouchableOpacity
                    style={[styles.detailApprovalButton, styles.approveButton]}
                    onPress={() => confirmApproval(selectedReflection.id, true)}
                  >
                    <Icon name="check" size={20} color="#fff" />
                    <Text style={styles.detailApprovalButtonText}>승인</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.detailApprovalButton, styles.rejectButton]}
                    onPress={() => confirmApproval(selectedReflection.id, false)}
                  >
                    <Icon name="close" size={20} color="#fff" />
                    <Text style={styles.detailApprovalButtonText}>반려</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          반성문
        </Text>
      </View>

      <View style={[styles.tabContainer, { backgroundColor: colors.surface }]}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'list' && { backgroundColor: colors.primary }
          ]}
          onPress={() => setActiveTab('list')}
        >
          <Icon
            name="list"
            size={20}
            color={activeTab === 'list' ? '#fff' : colors.textSecondary}
          />
          <Text style={[
            styles.tabText,
            { color: activeTab === 'list' ? '#fff' : colors.textSecondary }
          ]}>
            목록
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'write' && { backgroundColor: colors.primary }
          ]}
          onPress={() => setActiveTab('write')}
        >
          <Icon
            name="edit"
            size={20}
            color={activeTab === 'write' ? '#fff' : colors.textSecondary}
          />
          <Text style={[
            styles.tabText,
            { color: activeTab === 'write' ? '#fff' : colors.textSecondary }
          ]}>
            작성
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'list' ? renderReflectionList() : renderWriteForm()}

      {renderFeedbackModal()}
      {renderApprovalAnimationModal()}
      {renderDetailModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    marginHorizontal: 4,
    gap: 8,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },

  // 🔄 새로고침 버튼 스타일 추가
  refreshContainer: {
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 8,
    gap: 8,
  },
  refreshButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },

  summaryCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    borderRadius: 12,
    marginTop: 20,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  writeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
  },
  writeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  reflectionList: {
    gap: 16,
  },
  reflectionCard: {
    borderRadius: 12,
    padding: 16,
  },
  reflectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  reflectionTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  reflectionInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reflectionDate: {
    fontSize: 12,
    flex: 1,
  },
  approvalButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  approvalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  approveButton: {
    backgroundColor: '#10B981',
  },
  rejectButton: {
    backgroundColor: '#EF4444',
  },
  approvalButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  approvalInfoContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  approvalInfoText: {
    fontSize: 12,
    fontWeight: '500',
  },
  rejectionContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  rejectionText: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 8,
  },
  feedbackPreviewContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 12,
    borderRadius: 8,
  },
  feedbackPreviewLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  feedbackPreviewText: {
    fontSize: 12,
    lineHeight: 16,
  },

  // 작성 폼 스타일들
  approvalSection: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  approvalHeader: {
    marginBottom: 16,
  },
  approvalBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  approvalLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  approvalRightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  approverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 8,
    gap: 8,
  },
  approverName: {
    fontSize: 14,
    fontWeight: '500',
  },
  stampArea: {
    width: 60,
    height: 40,
    borderWidth: 2,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stampText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  infoSection: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    width: 60,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  formSection: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 24,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    lineHeight: 20,
    textAlignVertical: 'top',
  },
  signatureSection: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  signatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  signatureLabel: {
    fontSize: 14,
  },
  signatureBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 8,
    gap: 8,
  },
  signatureName: {
    fontSize: 14,
    fontWeight: '500',
  },
  signatureStamp: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  // 피드백 모달 스타일들
  feedbackOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  feedbackContainer: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
  },
  feedbackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  feedbackTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  feedbackCloseButton: {
    padding: 4,
  },
  feedbackDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  feedbackTextInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    lineHeight: 20,
    minHeight: 120,
    marginBottom: 24,
  },
  feedbackButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  feedbackButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  feedbackCancelButton: {
    backgroundColor: '#6B7280',
  },
  feedbackSubmitButton: {
    backgroundColor: '#EF4444',
  },
  feedbackCancelButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  feedbackSubmitButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },

  // 애니메이션 모달 스타일들
  animationOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  animationContainer: {
    alignItems: 'center',
  },
  stampContainer: {
    marginBottom: 24,
  },
  animatedStamp: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  animatedStampText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  animationText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },

  // 상세보기 모달 스타일들
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  closeButton: {
    padding: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 24,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  detailCard: {
    borderRadius: 12,
    padding: 20,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  detailInfo: {
    marginBottom: 24,
    gap: 4,
  },
  detailLabel: {
    fontSize: 14,
  },
  detailContent: {
    gap: 20,
  },
  detailSection: {
    marginBottom: 16,
  },
  detailSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  detailSectionContent: {
    fontSize: 14,
    lineHeight: 20,
  },
  detailFeedbackSection: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  detailFeedbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  detailFeedbackTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  detailFeedbackContent: {
    paddingLeft: 28,
  },
  detailFeedbackText: {
    fontSize: 14,
    lineHeight: 20,
  },
  detailApprovalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  detailApprovalButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  detailApprovalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
