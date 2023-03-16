import { SensorReadEvent } from '../../domain/SensorReadEvent';
import { Notification } from '../../domain/Notification';
import { SensorId } from '../../domain/Sensor';

export type ClientId = string;

export class ClientIdNotFound implements Error {
  name: 'ClientIdNotFound';
  message: string;

  constructor(id: ClientId) {
    this.message = `Client ID not found: ${id}`;
  }
}

/**
 * An AUTO-STOP manager
 * Manager should detect and close connection by themselves
 */
export interface ClientManager {
  generateNewClientId(): ClientId;
  openConnectionToClient(id: ClientId): void;

  /**
   *
   * @throws ClientIdNotFound
   */
  changeClientSubscription(clientId: ClientId, sensorIdx: SensorId[]): void;

  propagateNotifications(notificationList: Notification[]): void;
  propagateSensorReadEvent(event: SensorReadEvent): void;
}
