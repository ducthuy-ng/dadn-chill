import { LimitCheckMiddleware } from '../domain/LimitChecker';
import { SensorReadEvent } from '../domain/SensorReadEvent';
import { ClientManager } from './gateways/ClientManager';
import { NotificationRepo } from './repos/NotificationRepo';
import { ReadEventRepo } from './repos/ReadEventRepo';
import { SensorRepo } from './repos/SensorRepo';

export interface IProcessReadEventUC {
  execute(event: SensorReadEvent): void;
}

export class ProcessReadEventUseCase implements IProcessReadEventUC {
  sensorRepo: SensorRepo;

  notificationRepo: NotificationRepo;
  middleware: LimitCheckMiddleware;

  clientManager: ClientManager;

  readEventRepo: ReadEventRepo;

  constructor(
    sensorRepo: SensorRepo,
    notificationRepo: NotificationRepo,
    middleware: LimitCheckMiddleware,
    clientManager: ClientManager,
    readEventRepo: ReadEventRepo
  ) {
    this.sensorRepo = sensorRepo;
    this.notificationRepo = notificationRepo;
    this.middleware = middleware;
    this.clientManager = clientManager;
    this.readEventRepo = readEventRepo;
  }

  async execute(event: SensorReadEvent) {
    const processingSensor = await this.sensorRepo.getById(event.sensorId);
    processingSensor.processReadEvent(event);
    await this.sensorRepo.saveSensor(processingSensor);

    await this.readEventRepo.storeEvent(event);

    const notificationList = this.middleware.check(event, processingSensor);
    this.notificationRepo.add(...notificationList);
    this.clientManager.propagateNotifications(notificationList);

    this.clientManager.propagateSensorReadEvent(event);
  }
}
