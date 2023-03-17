import { NotificationRepo } from '../core/domain/Notification';
import { PageOutOfRange } from '../core/usecases/repos/SensorRepo';
import { Notification } from '../core/domain/Notification';

export class InMemNotificationRepo implements NotificationRepo {
  private notificationList: Notification[] = [];
  private pageSize = 10;

  add(...notifications: Notification[]): void {
    this.notificationList.concat(notifications);
  }

  getLastestNotification(pageNum: number): Notification[] {
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
