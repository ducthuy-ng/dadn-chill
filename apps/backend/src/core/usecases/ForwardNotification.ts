import { DomainRegistry } from '../../infras/DomainRegistry';
import { Notification } from '../domain/Notification';

export class ForwardNotificationUseCase {
  domainRegistry: DomainRegistry;

  constructor(domainRegistry: DomainRegistry) {
    this.domainRegistry = domainRegistry;
  }

  async execute(originSensorId: number, header: string, content: string): Promise<void> {
    const clientManager = this.domainRegistry.clientManager;
    const notificationRepo = this.domainRegistry.notificationRepo;
    const sensorRepo = this.domainRegistry.sensorRepo;

    const originSensor = await sensorRepo.getById(originSensorId);

    const newNotification = Notification.generate(originSensor, header, content);
    notificationRepo.add(newNotification);
    clientManager.propagateNotifications([newNotification]);
  }
}
