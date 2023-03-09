import { ClientManager } from '../core/domain/ClientManager';
import { SensorReadEvent } from '../core/domain/sensor/sensorReadEvent';

export class SSEClientManager implements ClientManager {
  propagateNotifications(notificationList: Notification[]) {
    throw new Error('Method not implemented.');
  }
  propagateSensorReadEvent(event: SensorReadEvent) {
    throw new Error('Method not implemented.');
  }
}
