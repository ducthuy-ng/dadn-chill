import { ClientManager } from '../core/domain/ClientManager';
import { Notification } from '../core/domain/notification';
import { SensorReadEvent } from '../core/domain/sensor/sensorReadEvent';

export class SSEClientManager implements ClientManager {
  propagateNotifications(notificationList: Notification[]) {
    throw notificationList;
  }

  propagateSensorReadEvent(event: SensorReadEvent) {
    throw event;
  }
}
