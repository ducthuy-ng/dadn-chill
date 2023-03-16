import { ClientId, ClientManager } from './gateways/ClientManager';

export class ClientSubscribeUseCase {
  private clientManager: ClientManager;

  constructor(clientManger: ClientManager) {
    this.clientManager = clientManger;
  }

  execute(): ClientId {
    const newId = this.clientManager.generateNewClientId();
    this.clientManager.openConnectionToClient(newId);

    return newId;
  }
}
