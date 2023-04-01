import { NotificationRepo } from './repos/NotificationRepo';
import { Notification } from '../domain/Notification';

export class GetAllNotificationsUseCase {
  private repo: NotificationRepo;

  constructor(repo: NotificationRepo) {
    this.repo = repo;
  }

  async execute(limit: number, offset: number): Promise<[Notification[], number]> {
    const slicedNotifications = await this.repo.getLatestNotification(limit, offset);
    const numOfNotification = await this.repo.getNotificationNum();

    return [slicedNotifications, numOfNotification];
  }
}
