import { PageOutOfRange } from '../core/usecases/repos/SensorRepo';
import { Notification } from '../core/domain/Notification';
import { NotificationRepo } from '../core/usecases/repos/NotificationRepo';

export class InMemNotificationRepo implements NotificationRepo {
  private notificationList: Notification[] = [];
  private pageSize = 10;

  async add(...notifications: Notification[]): Promise<void> {
    this.notificationList.concat(notifications);
  }

  async getLatestNotification(pageNum: number): Promise<Notification[]> {
    if (pageNum * this.pageSize > this.notificationList.length) {
      throw new PageOutOfRange(pageNum);
    }

    const notificationSlice = this.notificationList.slice(
      pageNum * this.pageSize,
      pageNum * (this.pageSize + 1)
    );

    return notificationSlice;
  }
}
