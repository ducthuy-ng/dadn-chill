import { SensorId } from '../domain/Sensor';
import { ClientId, ClientManager } from './gateways/ClientManager';

export class ChangeSubscriptionUseCase {
  private clientManager: ClientManager;

  constructor(clientManger: ClientManager) {
    this.clientManager = clientManger;
  }

  execute(clientId: ClientId, sensorIdx: SensorId[]) {
    this.clientManager.changeClientSubscription(clientId, sensorIdx);
  }
}
