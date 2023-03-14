import { SensorReadEvent } from './sensor/sensorReadEvent';
import { Notification } from './notification';

interface ClientManager {
  propagateNotifications(notificationList: Notification[]);
  propagateSensorReadEvent(event: SensorReadEvent);
}

export { ClientManager };
