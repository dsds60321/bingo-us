export class NotificationService {
  private static instance: NotificationService;

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  scheduleDailyMessage(
    id: string,
    message: string,
    time: string,
    callback?: (message: string) => void
  ): void {
    console.log(`📱 알림 설정됨: ${id} - ${message} (${time})`);
    if (callback) {
      callback(message);
    }
  }

  cancelNotification(id: string): void {
    console.log(`🚫 알림 취소됨: ${id}`);
  }
}
