import { ReadEventRepo } from '../domain/analysis/ReadEvent.repo';
import { ClientManager } from '../domain/ClientManager';
import { NotificationRepo } from '../domain/notification';
import { SensorRepo } from '../domain/sensor/sensor';
import { SensorReadEvent } from '../domain/sensor/sensorReadEvent';
import { LimitCheckMiddleware } from '../domain/sensor/sensorReadEvent/middleware';

export class ProcessReadEventUseCase {
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

  execute(event: SensorReadEvent) {
    const processingSensor = this.sensorRepo.getById(event.sensorId);
    processingSensor.processReadEvent(event);
    this.sensorRepo.saveSensor(processingSensor);

    this.readEventRepo.storeEvent(event);

    const notificationList = this.middleware.check(event, processingSensor);
    this.notificationRepo.add(...notificationList);
    this.clientManager.propagateNotifications(notificationList);

    this.clientManager.propagateSensorReadEvent(event);
  }
}
