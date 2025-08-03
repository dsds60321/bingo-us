import React, { useState } from 'react';
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
} from 'react-native';
import { useTheme } from '../../store/themeStore';
import { useAppStore } from '../../store/appStore';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { format } from 'date-fns';

type TabType = 'list' | 'write';

interface Reflection {
  id: string;
  incident: string;
  reason: string;
  improvement: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  author: string;
  approver?: string;
  approvedAt?: string;
  feedback?: string;
}

export function ReflectionScreen() {
  const colors = useTheme();
  const { user } = useAppStore();
  const [activeTab, setActiveTab] = useState<TabType>('list');
  const [selectedReflection, setSelectedReflection] = useState<Reflection | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isApprovalModalVisible, setIsApprovalModalVisible] = useState(false);
  const [pendingApproval, setPendingApproval] = useState<{id: string, approved: boolean} | null>(null);
  const [approvalAnimValue] = useState(new Animated.Value(0));
  const [stampRotation] = useState(new Animated.Value(0));
  const [stampScale] = useState(new Animated.Value(0));

  // 반성문 작성 폼 상태
  const [incident, setIncident] = useState('');
  const [reason, setReason] = useState('');
  const [improvement, setImprovement] = useState('');

  // 더미 데이터 (실제로는 store에서 가져와야 함)
  const [reflections, setReflections] = useState<Reflection[]>([
    {
      id: '1',
      incident: '데이트 약속에 30분 늦었습니다.',
      reason: '지하철이 지연되었고, 미리 출발하지 않았습니다.',
      improvement: '앞으로는 30분 일찍 출발하여 여유시간을 두겠습니다.',
      status: 'approved',
      createdAt: '2024-08-01T10:00:00Z',
      author: user?.name || '나',
      approver: '상대방님',
      approvedAt: '2024-08-01T15:30:00Z',
    },
    {
      id: '2',
      incident: '상대방의 말을 끝까지 듣지 않고 화를 냈습니다.',
      reason: '스트레스를 받고 있던 상황에서 감정 조절에 실패했습니다.',
      improvement: '화가 날 때는 먼저 심호흡을 하고 상대방의 말을 끝까지 듣겠습니다.',
      status: 'pending',
      createdAt: '2024-08-02T14:00:00Z',
      author: '상대방님', // 상대방이 작성한 반성문
    },
    {
      id: '3',
      incident: '기념일을 깜빡했습니다.',
      reason: '업무에 집중하느라 중요한 날짜를 놓쳤습니다.',
      improvement: '캘린더에 기념일을 미리 등록하고 알림을 설정하겠습니다.',
      status: 'rejected',
      createdAt: '2024-07-30T09:00:00Z',
      author: user?.name || '나',
      approver: '상대방님',
      approvedAt: '2024-07-30T18:00:00Z',
      feedback: '반성의 마음이 부족해 보입니다. 더 구체적으로 작성해주세요.',
    },
  ]);

  const handleSubmit = () => {
    if (!incident.trim() || !reason.trim() || !improvement.trim()) {
      Alert.alert('알림', '모든 항목을 입력해주세요.');
      return;
    }

    Alert.alert(
      '반성문 제출',
      '반성문을 제출하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '제출',
          onPress: () => {
            // TODO: 반성문 제출 로직
            Alert.alert('완료', '반성문이 제출되었습니다.');
            // 폼 초기화
            setIncident('');
            setReason('');
            setImprovement('');
            setActiveTab('list'); // 목록 탭으로 이동
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
  const handleApproval = (reflectionId: string, approved: boolean) => {
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

    // 4단계: 애니메이션 완료 후 상태 업데이트 및 결과 표시
    setTimeout(() => {
      // 반성문 상태 업데이트
      setReflections(prev => prev.map(reflection =>
        reflection.id === reflectionId
          ? {
            ...reflection,
            status: approved ? 'approved' : 'rejected',
            approver: user?.name || '나',
            approvedAt: new Date().toISOString(),
          }
          : reflection
      ));

      // 애니메이션 모달 닫기
      setIsApprovalModalVisible(false);
      setPendingApproval(null);

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
    }, 2200); // 애니메이션 시간 + 여유시간
  };

  // 결재 확인 Alert - 신중한 결정을 위해 추가
  const confirmApproval = (reflectionId: string, approved: boolean) => {
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
      case 'pending': return '결재 대기';
      case 'approved': return '승인됨';
      case 'rejected': return '반려됨';
      default: return '알 수 없음';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#F59E0B';
      case 'approved': return '#10B981';
      case 'rejected': return '#EF4444';
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
    return reflection.status === 'pending' && reflection.author !== (user?.name || '나');
  };

  const renderReflectionList = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      <View style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryNumber, { color: '#F59E0B' }]}>
              {reflections.filter(r => r.status === 'pending').length}
            </Text>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
              결재 대기
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryNumber, { color: '#10B981' }]}>
              {reflections.filter(r => r.status === 'approved').length}
            </Text>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
              승인됨
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryNumber, { color: '#EF4444' }]}>
              {reflections.filter(r => r.status === 'rejected').length}
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
                  작성자: {reflection.author} • {formatDate(reflection.createdAt)}
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

              {reflection.status === 'approved' && reflection.approvedAt && (
                <Text style={[styles.approvalInfo, { color: '#10B981' }]}>
                  {reflection.approver}님이 {formatDate(reflection.approvedAt)}에 승인
                </Text>
              )}
              {reflection.status === 'rejected' && reflection.feedback && (
                <Text style={[styles.feedbackText, { color: '#EF4444' }]} numberOfLines={2}>
                  피드백: {reflection.feedback}
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
        style={[styles.submitButton, { backgroundColor: colors.primary }]}
        onPress={handleSubmit}
      >
        <Icon name="send" size={20} color="#fff" />
        <Text style={styles.submitButtonText}>반성문 제출</Text>
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
      <View style={[styles.container, { backgroundColor: colors.background }]}>
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
                  작성자: {selectedReflection.author}
                </Text>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                  작성일: {formatDate(selectedReflection.createdAt)}
                </Text>
                {selectedReflection.approvedAt && (
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                    처리일: {formatDate(selectedReflection.approvedAt)}
                  </Text>
                )}
              </View>

              <View style={styles.detailSection}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  1. 잘못한 일
                </Text>
                <Text style={[styles.sectionContent, { color: colors.text }]}>
                  {selectedReflection.incident}
                </Text>
              </View>

              <View style={styles.detailSection}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  2. 잘못한 이유
                </Text>
                <Text style={[styles.sectionContent, { color: colors.text }]}>
                  {selectedReflection.reason}
                </Text>
              </View>

              <View style={styles.detailSection}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  3. 앞으로의 개선 방안
                </Text>
                <Text style={[styles.sectionContent, { color: colors.text }]}>
                  {selectedReflection.improvement}
                </Text>
              </View>

              {selectedReflection.feedback && (
                <View style={[styles.feedbackSection, { backgroundColor: '#FEE2E2' }]}>
                  <Text style={[styles.feedbackTitle, { color: '#DC2626' }]}>
                    피드백
                  </Text>
                  <Text style={[styles.feedbackContent, { color: '#DC2626' }]}>
                    {selectedReflection.feedback}
                  </Text>
                </View>
              )}

              {/* 상세보기에서도 결재 버튼 표시 */}
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
                    <Text style={styles.detailApprovalButtonText}>반료</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </ScrollView>
        )}
      </View>
    </Modal>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* 헤더 */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          반성문
        </Text>

        {/* 탭 버튼 */}
        <View style={[styles.tabContainer, { backgroundColor: colors.background }]}>
          <TouchableOpacity
            style={[
              styles.tabButton,
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
              styles.tabButton,
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
      </View>

      {/* 탭 컨텐츠 */}
      {activeTab === 'list' ? renderReflectionList() : renderWriteForm()}

      {/* 상세보기 모달 */}
      {renderDetailModal()}

      {/* 결재 애니메이션 모달 */}
      {renderApprovalAnimationModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 90,
    paddingBottom: 20,
    paddingHorizontal: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  // 요약 카드 스타일
  summaryCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  // 반성문 목록 스타일
  reflectionList: {
    gap: 12,
  },
  reflectionCard: {
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  reflectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  reflectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 12,
    lineHeight: 22,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 70,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  reflectionInfo: {
    marginBottom: 8,
  },
  reflectionDate: {
    fontSize: 12,
    marginBottom: 8,
  },
  // 결재 버튼 스타일
  approvalButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  approvalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
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
  // 상세보기 결재 버튼
  detailApprovalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  detailApprovalButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  detailApprovalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // 애니메이션 모달 스타일
  animationOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  animationContainer: {
    alignItems: 'center',
  },
  stampContainer: {
    marginBottom: 30,
  },
  animatedStamp: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  animatedStampText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  animationText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  approvalInfo: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  feedbackText: {
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
  // 빈 상태 스타일
  emptyState: {
    alignItems: 'center',
    padding: 40,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  writeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  writeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  // 모달 스타일
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
    padding: 20,
  },
  detailCard: {
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  detailLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  detailSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionContent: {
    fontSize: 14,
    lineHeight: 20,
  },
  feedbackSection: {
    padding: 16,
    borderRadius: 8,
    marginTop: 12,
  },
  feedbackTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  feedbackContent: {
    fontSize: 14,
    lineHeight: 20,
  },
  // 기존 작성 폼 스타일들
  approvalSection: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  approvalHeader: {
    marginBottom: 20,
  },
  approvalBox: {
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  approvalLabel: {
    fontSize: 12,
    marginBottom: 5,
  },
  approverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
    minWidth: 120,
  },
  approverName: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  stampArea: {
    width: 60,
    height: 60,
    borderWidth: 2,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stampText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  infoSection: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 15,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    width: 70,
    fontSize: 14,
    fontWeight: '600',
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
  },
  formSection: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 15,
    fontSize: 14,
    textAlignVertical: 'top',
    minHeight: 100,
  },
  signatureSection: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  signatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  signatureLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  signatureBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  signatureName: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 10,
  },
  signatureStamp: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
