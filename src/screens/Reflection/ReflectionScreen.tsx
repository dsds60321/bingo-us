import React, { useState, useEffect } from 'react';
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
  const [pendingApproval, setPendingApproval] = useState<{id: number, approved: boolean} | null>(null);
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

  // 화면 로드 시 반성문 목록 불러오기
  useEffect(() => {
    loadReflections();
  }, []);

  // 반성문 목록 로드
  const loadReflections = async () => {

    // console.log('coupleId ' ,couple.users.filter(user -> user.id !== user.id).id)
    if (!couple?.id) {
      console.warn('Couple ID not found');
      return;
    }

    try {
      setIsLoading(true);
      const response = await reflectionService.getReflections();

      console.log('----- ' , response)

      if (response.success && response.data) {
        setReflections(response.data);
      } else {
        console.error('Failed to load reflections:', response.message);
        Alert.alert('오류', response.message || '반성문 목록을 불러오는데 실패했습니다.');
      }
    } catch (error) {
      console.error('Error loading reflections:', error);
      Alert.alert('오류', '반성문 목록을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

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
    // 애니메이션 초기화
    stampRotation.setValue(0);
    stampScale.setValue(0);
    approvalAnimValue.setValue(0);

    // 도장 회전 및 확대 애니메이션
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

  // 결재 처리 - 단계별 실행
  const handleApproval = async (reflectionId: number, approved: boolean) => {
    if (!user?.id) {
      Alert.alert('오류', '사용자 정보가 없습니다.');
      return;
    }

    // 1단계: 상세보기 모달이 열려있다면 먼저 닫기
    if (isDetailModalVisible) {
      setIsDetailModalVisible(false);
    }

    // 2단계: 결재 정보 저장 및 애니메이션 모달 열기
    setPendingApproval({ id: reflectionId, approved });
    setIsApprovalModalVisible(true);

    // 3단계: 애니메이션 시작 (모달이 열린 후 실행)
    setTimeout(() => {
      startApprovalAnimation();
    }, 100);

    // 4단계: 백엔드 API 호출
    try {
      const approvalData = {
        approver_user_id: user.id,
        status: approved ? 'APPROVED' as const : 'REJECTED' as const,
      };

      const response = await reflectionService.approveReflection(reflectionId, approvalData);

      // 5단계: 애니메이션 완료 후 결과 처리
      setTimeout(async () => {
        // 애니메이션 모달 닫기
        setIsApprovalModalVisible(false);
        setPendingApproval(null);

        if (response.success) {
          // 반성문 목록 새로고침
          await loadReflections();

          // 결과 Alert 표시
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
      }, 2200); // 애니메이션 시간 + 여유시간
    } catch (error) {
      console.error('Error approving reflection:', error);

      // 애니메이션 모달 닫기
      setTimeout(() => {
        setIsApprovalModalVisible(false);
        setPendingApproval(null);
        Alert.alert('오류', '결재 처리 중 오류가 발생했습니다.');
      }, 2200);
    }
  };

  // 결재 확인 Alert - 신중한 결정을 위해 추가
  const confirmApproval = (reflectionId: number, approved: boolean) => {
    const action = approved ? '승인' : '반려';
    const reflection = reflections.find(r => r.id === reflectionId);

    Alert.alert(
      `반성문 ${action}`,
      `"${reflection?.incident}"에 대한 반성문을 ${action}하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: action,
          style: approved ? 'default' : 'destructive',
          onPress: () => handleApproval(reflectionId, approved)
        }
      ]
    );
  };

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

  // 결재 가능한 반성문인지 확인 (상대방이 작성하고 대기 중인 것)
  const canApprove = (reflection: Reflection) => {
    return reflection.status === 'PENDING' && reflection.author_user_id !== user?.id;
  };

  // 작성자 이름 표시
  const getAuthorName = (reflection: Reflection) => {
    return reflection.author_user_id === user?.id ? user?.name || '나' : '상대방님';
  };

  // 결재자 이름 표시
  const getApproverName = (reflection: Reflection) => {
    if (!reflection.approver_user_id) return '';
    return reflection.approver_user_id === user?.id ? user?.name || '나' : '상대방님';
  };

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
            작성된 반성문이 없습니다
          </Text>
          <TouchableOpacity
            style={[styles.writeButton, { backgroundColor: colors.primary }]}
            onPress={() => setActiveTab('write')}
          >
            <Icon name="edit" size={20} color="#fff" />
            <Text style={styles.writeButtonText}>반성문 작성하기</Text>
          </TouchableOpacity>
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

                {/* 결재 버튼 */}
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

              {reflection.status === 'APPROVED' && reflection.approved_at && (
                <Text style={[styles.approvalInfo, { color: '#10B981' }]}>
                  {getApproverName(reflection)}님이 {formatDate(reflection.approved_at)}에 승인
                </Text>
              )}
              {reflection.status === 'REJECTED' && (
                <Text style={[styles.feedbackText, { color: '#EF4444' }]} numberOfLines={2}>
                  {getApproverName(reflection)}님이 {reflection.approved_at ? formatDate(reflection.approved_at) : ''}에 반려
                </Text>
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
      {/* 결재 정보 */}
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

        {/* 기본 정보 */}
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


      {/* 반성문 내용 */}
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

      {/* 서명 섹션 */}
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

      {/* 제출 버튼 */}
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
              </View>

              {/* 결재 버튼 (상세보기에서도 표시) */}
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
      {/* 헤더 */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          반성문
        </Text>
      </View>

      {/* 탭 헤더 */}
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

      {/* 컨텐츠 */}
      {activeTab === 'list' ? renderReflectionList() : renderWriteForm()}

      {/* 상세보기 모달 */}
      {renderDetailModal()}

      {/* 결재 애니메이션 모달 */}
      {renderApprovalAnimationModal()}
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
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 12,
    margin: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  // 통계 카드
  summaryCard: {
    borderRadius: 16,
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
    fontSize: 14,
  },
  // 빈 상태
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    borderRadius: 16,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
    marginBottom: 24,
  },
  writeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  writeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // 반성문 목록
  reflectionList: {
    gap: 16,
  },
  reflectionCard: {
    borderRadius: 16,
    padding: 16,
  },
  reflectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
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
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  reflectionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reflectionDate: {
    fontSize: 14,
    flex: 1,
  },
  approvalButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  approvalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
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
  approvalInfo: {
    fontSize: 12,
    marginTop: 8,
  },
  feedbackText: {
    fontSize: 12,
    marginTop: 8,
  },
  // 작성 폼
  approvalSection: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  approvalHeader: {
    marginBottom: 16,
  },
  approvalBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  approvalLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  approvalRightSection: {
    alignItems: 'center',
    gap: 12,
  },
  approverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 8,
    gap: 8,
    minWidth: 120,
    justifyContent: 'center',
  },
  approverName: {
    fontSize: 14,
    fontWeight: '600',
  },
  stampArea: {
    width: 80,
    height: 80,
    borderWidth: 2,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  stampText: {
    fontSize: 16,
    fontWeight: 'bold',
  },

  // 기본 정보 섹션
  infoSection: {
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 16,
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    width: 60,
  },
  infoValue: {
    fontSize: 14,
    flex: 1,
  },
  formSection: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    textAlignVertical: 'top',
    minHeight: 100,
  },
  signatureSection: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  signatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  signatureLabel: {
    fontSize: 16,
  },
  signatureBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 8,
  },
  signatureName: {
    fontSize: 16,
    fontWeight: '600',
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
    marginBottom: 16,
    gap: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // 애니메이션 모달
  animationOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  animationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  stampContainer: {
    marginBottom: 20,
  },
  animatedStamp: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
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
  // 상세보기 모달
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  closeButton: {
    padding: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 32,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  detailCard: {
    borderRadius: 16,
    padding: 20,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  detailTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  detailInfo: {
    gap: 4,
    marginBottom: 20,
  },
  detailLabel: {
    fontSize: 14,
  },
  detailContent: {
    gap: 20,
  },
  detailSection: {
    gap: 8,
  },
  detailSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  detailSectionContent: {
    fontSize: 15,
    lineHeight: 22,
  },
  detailApprovalButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 24,
  },
  detailApprovalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  detailApprovalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
