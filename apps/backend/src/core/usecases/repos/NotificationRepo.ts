import { Notification } from '../../domain/Notification';

export interface NotificationRepo {
  add(...notifications: Notification[]): Promise<void>;

  getLatestNotification(offset: number, limit: number): Promise<Notification[]>;

  getNotificationNum(): Promise<number>;
}
