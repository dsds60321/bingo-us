import { apiClient } from './ApiClient';
import { API_ENDPOINTS } from '../constants/config';

// Push 알림 타입 정의
export interface PushNotificationRequest {
    targetUserId: string;
    type: 'reflection_created' | 'reflection_updated' | 'reflection_approved' | 'reflection_rejected';
    title: string;
    body: string;
    data?: {
        reflectionId: string;
        screen?: string;
        action?: string;
    };
}

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}

class PushNotificationService {
    /**
     * 반성문 생성 시 상대방에게 알림 전송
     */
    async sendReflectionCreatedNotification(
        targetUserId: string,
        authorNickname: string,
        reflectionId: number,
        incident: string
    ): Promise<ApiResponse> {
        try {
            const notificationData: PushNotificationRequest = {
                targetUserId,
                type: 'reflection_created',
                title: `💭 새로운 반성문이 도착했어요`,
                body: `${authorNickname}님이 반성문을 작성했습니다: "${incident.substring(0, 30)}${incident.length > 30 ? '...' : ''}"`,
                data: {
                    reflectionId: reflectionId.toString(),
                    screen: 'ReflectionDetail',
                    action: 'view_reflection'
                }
            };

            return await this.sendPushNotification(notificationData);
        } catch (error) {
            console.error('❌ 반성문 생성 알림 전송 실패:', error);
            return { success: false, message: '알림 전송에 실패했습니다.' };
        }
    }

    /**
     * 반성문 수정 시 상대방에게 알림 전송
     */
    async sendReflectionUpdatedNotification(
        targetUserId: string,
        authorNickname: string,
        reflectionId: number,
        incident: string
    ): Promise<ApiResponse> {
        try {
            const notificationData: PushNotificationRequest = {
                targetUserId,
                type: 'reflection_updated',
                title: `✏️ 반성문이 수정되었어요`,
                body: `${authorNickname}님이 반성문을 수정했습니다: "${incident.substring(0, 30)}${incident.length > 30 ? '...' : ''}"`,
                data: {
                    reflectionId: reflectionId.toString(),
                    screen: 'ReflectionDetail',
                    action: 'view_updated_reflection'
                }
            };

            return await this.sendPushNotification(notificationData);
        } catch (error) {
            console.error('❌ 반성문 수정 알림 전송 실패:', error);
            return { success: false, message: '알림 전송에 실패했습니다.' };
        }
    }

    /**
     * 반성문 승인 시 작성자에게 알림 전송
     */
    async sendReflectionApprovedNotification(
        targetUserId: string,
        approverNickname: string,
        reflectionId: number,
        feedback?: string
    ): Promise<ApiResponse> {
        try {
            const notificationData: PushNotificationRequest = {
                targetUserId,
                type: 'reflection_approved',
                title: `✅ 반성문이 승인되었어요`,
                body: feedback
                    ? `${approverNickname}님이 반성문을 승인했습니다: "${feedback}"`
                    : `${approverNickname}님이 반성문을 승인했습니다`,
                data: {
                    reflectionId: reflectionId.toString(),
                    screen: 'ReflectionDetail',
                    action: 'view_approved_reflection'
                }
            };

            return await this.sendPushNotification(notificationData);
        } catch (error) {
            console.error('❌ 반성문 승인 알림 전송 실패:', error);
            return { success: false, message: '알림 전송에 실패했습니다.' };
        }
    }

    /**
     * 반성문 거부 시 작성자에게 알림 전송
     */
    async sendReflectionRejectedNotification(
        targetUserId: string,
        approverNickname: string,
        reflectionId: number,
        feedback: string
    ): Promise<ApiResponse> {
        try {
            const notificationData: PushNotificationRequest = {
                targetUserId,
                type: 'reflection_rejected',
                title: `❌ 반성문이 반려되었어요`,
                body: `${approverNickname}님이 반성문을 반려했습니다: "${feedback.substring(0, 50)}${feedback.length > 50 ? '...' : ''}"`,
                data: {
                    reflectionId: reflectionId.toString(),
                    screen: 'ReflectionDetail',
                    action: 'view_rejected_reflection'
                }
            };

            return await this.sendPushNotification(notificationData);
        } catch (error) {
            console.error('❌ 반성문 거부 알림 전송 실패:', error);
            return { success: false, message: '알림 전송에 실패했습니다.' };
        }
    }

    /**
     * 서버로 Push 알림 전송 요청
     */
    private async sendPushNotification(notificationData: PushNotificationRequest): Promise<ApiResponse> {
        try {
            console.log('📤 Push 알림 전송 요청:', {
                target: notificationData.targetUserId,
                type: notificationData.type,
                title: notificationData.title
            });

            const response = await apiClient.post(
                API_ENDPOINTS.notification?.send || '/notifications/send',
                notificationData
            );

            if (response.data.success) {
                console.log('✅ Push 알림 전송 성공');
                return {
                    success: true,
                    message: '알림이 전송되었습니다.'
                };
            } else {
                console.log('⚠️ Push 알림 전송 실패:', response.data.message);
                return {
                    success: false,
                    message: response.data.message || '알림 전송에 실패했습니다.'
                };
            }
        } catch (error: any) {
            console.error('❌ Push 알림 전송 API 오류:', error);
            return {
                success: false,
                message: error.response?.data?.message || '알림 전송 중 오류가 발생했습니다.'
            };
        }
    }
}

export const pushNotificationService = new PushNotificationService();
