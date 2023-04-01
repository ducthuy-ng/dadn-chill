import { Notification } from '../core/domain/Notification';
import { NotificationRepo } from '../core/usecases/repos/NotificationRepo';

export class InMemNotificationRepo implements NotificationRepo {
  private notificationList: Notification[] = [];

  async add(...notifications: Notification[]): Promise<void> {
    this.notificationList = this.notificationList.concat(notifications);
  }

  async getLatestNotification(offset: number, limit: number): Promise<Notification[]> {
    return this.notificationList.slice(offset, offset + limit);
  }

  async getNotificationNum(): Promise<number> {
    return this.notificationList.length;
  }

  clean() {
    this.notificationList = [];
  }
}
