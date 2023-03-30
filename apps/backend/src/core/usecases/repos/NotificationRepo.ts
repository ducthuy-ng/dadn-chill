import { Notification } from '../../domain/Notification';

export interface NotificationRepo {
  add(...notifications: Notification[]): Promise<void>;

  /**
   *
   * @throws {PageOutOfRange}
   */
  getLatestNotification(pageNum: number): Promise<Notification[]>;
}
