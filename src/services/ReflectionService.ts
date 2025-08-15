import { AxiosResponse } from 'axios';
import { API_ENDPOINTS } from '../constants/config';
import { apiClient } from './ApiClient';
import {useAppStore} from "../store/appStore.ts";
import {pushNotificationService} from "./PushNotificationService.ts";

// 타입 정의
export interface Reflection {
  id: number;
  couple_id: number;
  author_user_id: number;
  incident: string;
  reason: string;
  improvement: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  approver_user_id?: number;
  approved_at?: string;
  feedback?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateReflectionRequest {
  couple_id: number;
  author_user_id: string;
  approver_user_id: string;
  incident: string;
  reason: string;
  improvement: string;
}

export interface ApprovalRequest {
  status: 'APPROVED' | 'REJECTED';
  feedback?: string;
}

export interface ReflectionStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

// API 응답 데이터 타입 정의
interface BackendResponse<T = any> {
  success: boolean;
  message: string;
  code: string;
  data: T;
  timestamp: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

class ReflectionService {
  /**
   * 반성문 생성
   * @param reflectionData 반성문 데이터
   * @returns 생성된 반성문 정보
   */
  async createReflection(reflectionData: CreateReflectionRequest): Promise<ApiResponse<Reflection>> {
    try {
      console.log('Creating reflection:', reflectionData);

      const response: AxiosResponse<BackendResponse<Reflection>> = await apiClient.post(
        API_ENDPOINTS.reflection.create,
        reflectionData
      );

      console.log('Create reflection response:', response.data);

      if (response.data.success && response.data.code === '200') {
          const createdReflection = response.data.data;

          try {
              const { user } = useAppStore.getState();
              const authorNickname = user?.nickname || '상대방';

              await pushNotificationService.sendReflectionCreatedNotification(
                  reflectionData.approver_user_id,
                  authorNickname,
                  createdReflection.id,
                  createdReflection.incident
              );

              console.log('✅ 반성문 생성 알림 전송 완료');
          } catch (notificationError) {
              console.error('⚠️ 알림 전송 실패 (반성문 생성은 성공):', notificationError);
              // 알림 전송 실패해도 반성문 생성은 성공으로 처리
          }


          return {
          success: true,
          data: createdReflection,
          message: response.data.message,
        };
      }

      return {
        success: false,
        message: response.data.message || '반성문 등록에 실패했습니다.',
      };
    } catch (error: any) {
      console.error('Create reflection error:', error);

      return {
        success: false,
        message: error.response?.data?.message || '반성문 등록 중 오류가 발생했습니다.',
      };
    }
  }

  /**
   * 커플 ID로 반성문 목록 조회
   * @param coupleId 커플 ID
   * @returns 반성문 목록
   */
  async getReflections(): Promise<ApiResponse<Reflection[]>> {
    try {
      const response: AxiosResponse<BackendResponse<Reflection[]>> = await apiClient.get(
        `${API_ENDPOINTS.reflection.list}`
      );

      if (response.data.success && response.data.code === '200') {
        // ✅ 데이터가 없거나 null인 경우 빈 배열 반환
        const data = response.data.data || [];

        const mappedData: Reflection[] = data.map((item: any) => ({
          id: item.id,
          couple_id: item.coupleId,
          author_user_id: item.authorUserId,
          approver_user_id: item.approverUserId,
          incident: item.incident,
          reason: item.reason,
          improvement: item.improvement,
          status: item.status,
          feedback: item.feedback,
          approved_at: item.approvedAt,
          created_at: item.createdAt,
          updated_at: item.updatedAt || item.createdAt
        }));

        return {
          success: true,
          data: mappedData, // 빈 배열이어도 안전하게 반환
        };
      }

      // ✅ API 호출은 성공했지만 데이터가 없는 경우에도 빈 배열 반환
      return {
        success: true,
        data: [], // 성공이지만 데이터 없음
        message: response.data.message || '반성문이 없습니다.',
      };
    } catch (error: any) {
      console.error('Get reflections error:', error);
      return {
        success: false,
        message: error.response?.data?.message || '반성문 목록 조회 중 오류가 발생했습니다.',
        data: [], // 에러 시에도 빈 배열 반환
      };
    }
  }



  /**
   * 반성문 승인/거부
   * @param reflectionId 반성문 ID
   * @param approvalData 승인/거부 데이터
   * @returns 승인/거부 결과
   */
  async approveReflection(reflectionId: number, approvalData: ApprovalRequest): Promise<ApiResponse<void>> {
      try {
          console.log('🔍 반성문 승인/거부 시작:', { reflectionId, approvalData });

          // REJECTED일 때 feedback이 필수인지 검증
          if (approvalData.status === 'REJECTED' && !approvalData.feedback?.trim()) {
              return {
                  success: false,
                  message: '반려 시 피드백을 입력해주세요.',
              };
          }

          // 먼저 반성문 정보를 가져와서 작성자 정보 확인
          const reflectionResponse = await this.getReflectionById(reflectionId);
          if (!reflectionResponse.success || !reflectionResponse.data) {
              return {
                  success: false,
                  message: '반성문 정보를 찾을 수 없습니다.',
              };
          }

          console.log('reflectionResponse:', reflectionResponse);

          const reflection = reflectionResponse.data;
          const response: AxiosResponse<BackendResponse<void>> = await apiClient.put(
              `${API_ENDPOINTS.reflection.update}/${reflectionId}`,
              approvalData
          );

          if (response.data.success && response.data.code === '200') {
              // ⭐ 승인/거부 성공 시 작성자에게 Push 알림 전송
              try {
                  const { user } = useAppStore.getState();
                  const approverNickname = user?.nickname || '상대방';

                  if (approvalData.status === 'APPROVED') {
                      await pushNotificationService.sendReflectionApprovedNotification(
                          reflection.authorUserId,
                          approverNickname,
                          reflectionId,
                          approvalData.feedback
                      );
                      console.log('✅ 반성문 승인 알림 전송 완료');
                  } else if (approvalData.status === 'REJECTED') {
                      await pushNotificationService.sendReflectionRejectedNotification(
                          reflection.authorUserId,
                          approverNickname,
                          reflectionId,
                          approvalData.feedback!
                      );
                      console.log('✅ 반성문 거부 알림 전송 완료');
                  }
              } catch (notificationError) {
                  console.error('⚠️ 알림 전송 실패 (승인/거부는 성공):', notificationError);
              }

              return {
                  success: true,
                  message: response.data.message,
              };
          }

          return {
              success: false,
              message: response.data.message || '결재 처리에 실패했습니다.',
          };
      } catch (error: any) {
          console.error('❌ 반성문 승인/거부 오류:', error);
          return {
              success: false,
              message: error.response?.data?.message || '결재 처리 중 오류가 발생했습니다.',
          };
      }
  }

    /**
     * 반성문 단일 조회 (승인/거부 시 필요)
     */
    private async getReflectionById(reflectionId: number): Promise<ApiResponse<Reflection>> {
        try {
            const response: AxiosResponse<BackendResponse<Reflection>> = await apiClient.get(
                `${API_ENDPOINTS.reflection.detail}/${reflectionId}`
            );

            if (response.data.success && response.data.code === '200') {
                return {
                    success: true,
                    data: response.data.data,
                };
            }

            return {
                success: false,
                message: response.data.message || '반성문을 찾을 수 없습니다.',
            };
        } catch (error: any) {
            console.error('❌ 반성문 조회 오류:', error);
            return {
                success: false,
                message: error.response?.data?.message || '반성문 조회 중 오류가 발생했습니다.',
            };
        }
    }



    /**
   * 반성문 통계 조회
   * @param coupleId 커플 ID
   * @returns 반성문 통계 정보
   */
  async getReflectionStats(coupleId: number): Promise<ApiResponse<ReflectionStats>> {
    try {
      const response: AxiosResponse<BackendResponse<ReflectionStats>> = await apiClient.get(
        `${API_ENDPOINTS.reflection.stats}?coupleId=${coupleId}`
      );

      if (response.data.success && response.data.code === '200') {
        return {
          success: true,
          data: response.data.data,
        };
      }

      return {
        success: false,
        message: response.data.message || '통계 데이터를 불러오는데 실패했습니다.',
        data: {
          total: 0,
          pending: 0,
          approved: 0,
          rejected: 0,
        },
      };
    } catch (error: any) {
      console.error('Get reflection stats error:', error);
      return {
        success: false,
        message: error.response?.data?.message || '통계 조회 중 오류가 발생했습니다.',
        data: {
          total: 0,
          pending: 0,
          approved: 0,
          rejected: 0,
        },
      };
    }
  }

  /**
   * 반성문 수정
   * @param reflectionId 반성문 ID
   * @param reflectionData 수정할 반성문 데이터
   * @returns 수정된 반성문 정보
   */
  async updateReflection(reflectionId: number, reflectionData: Partial<CreateReflectionRequest>): Promise<ApiResponse<Reflection>> {
    try {
      const response: AxiosResponse<BackendResponse<Reflection>> = await apiClient.put(
        `${API_ENDPOINTS.reflection.update}/${reflectionId}`,
        reflectionData
      );

      if (response.data.success && response.data.code === '200') {
          const updatedReflection = response.data.data;

          try {
              const { user } = useAppStore.getState();
              const authorNickname = user?.nickname || '상대방';

              if (updatedReflection.approver_user_id) {
                  await pushNotificationService.sendReflectionUpdatedNotification(
                      updatedReflection.approver_user_id.toString(),
                      authorNickname,
                      updatedReflection.id,
                      updatedReflection.incident
                  );

                  console.log('✅ 반성문 수정 알림 전송 완료');
              }
          } catch (notificationError) {
              console.error('⚠️ 알림 전송 실패 (반성문 수정은 성공):', notificationError);
          }

          return {
          success: true,
          data: updatedReflection,
          message: response.data.message,
        };
      }

      return {
        success: false,
        message: response.data.message || '반성문 수정에 실패했습니다.',
      };
    } catch (error: any) {
      console.error('Update reflection error:', error);
      return {
        success: false,
        message: error.response?.data?.message || '반성문 수정 중 오류가 발생했습니다.',
      };
    }
  }

  /**
   * 반성문 삭제
   * @param reflectionId 반성문 ID
   * @returns 삭제 결과
   */
  async deleteReflection(reflectionId: number): Promise<ApiResponse<void>> {
    try {
      const response: AxiosResponse<BackendResponse<void>> = await apiClient.delete(
        `${API_ENDPOINTS.reflection.delete}/${reflectionId}`
      );

      if (response.data.success && response.data.code === '200') {
        return {
          success: true,
          message: response.data.message || '반성문이 삭제되었습니다.',
        };
      }

      return {
        success: false,
        message: response.data.message || '반성문 삭제에 실패했습니다.',
      };
    } catch (error: any) {
      console.error('Delete reflection error:', error);
      return {
        success: false,
        message: error.response?.data?.message || '반성문 삭제 중 오류가 발생했습니다.',
      };
    }
  }

  /**
   * 사용자별 반성문 조회
   * @param userId 사용자 ID
   * @param coupleId 커플 ID
   * @returns 사용자가 작성한 반성문 목록
   */
  async getReflectionsByUserId(userId: number, coupleId: number): Promise<ApiResponse<Reflection[]>> {
    try {
      const response: AxiosResponse<BackendResponse<Reflection[]>> = await apiClient.get(
        `${API_ENDPOINTS.reflection.byUser}?userId=${userId}&coupleId=${coupleId}`
      );

      if (response.data.success && response.data.code === '200') {
        return {
          success: true,
          data: response.data.data || [],
        };
      }

      return {
        success: false,
        message: response.data.message || '사용자 반성문을 불러오는데 실패했습니다.',
        data: [],
      };
    } catch (error: any) {
      console.error('Get reflections by user error:', error);
      return {
        success: false,
        message: error.response?.data?.message || '사용자 반성문 조회 중 오류가 발생했습니다.',
        data: [],
      };
    }
  }
}

// 싱글톤 인스턴스 export
export const reflectionService = new ReflectionService();
