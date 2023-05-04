import axios from 'axios';
import { ExpressServer } from '.';
import { Sensor } from '../../core/domain/Sensor';
import { SensorReadEvent } from '../../core/domain/SensorReadEvent';
import { ForwardNotificationUseCase } from '../../core/usecases';
import { ClientId, ClientManager } from '../../core/usecases/gateways/ClientManager';
import { LogLevel } from '../../core/usecases/Logger';
import { BSLogger } from '../BSLogger';
import { InMemConfigManager } from '../ConfigManager/InMemConfigManager';
import { DomainRegistry } from '../DomainRegistry';
import { InMemNotificationRepo } from '../InMemNotificationRepo';
import { InMemSensorRepo } from '../InMemSensorRepo';

export class MockClientManager implements ClientManager {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  changeClientSubscription(clientId: string, sensorIdx: number[]): void {
    throw new Error('Method not implemented.');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  openConnectionToClient(id: string): void {
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  closeConnectionToClient(id: string): void {
    return;
  }

  generateNewClientId(): ClientId {
    return;
  }

  propagateNotifications = jest.fn(() => {
    return;
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  propagateSensorReadEvent = jest.fn((event: SensorReadEvent) => {
    return;
  });
}

describe('Test webhook for Notification forwarder', () => {
  const configs = new InMemConfigManager();
  configs.randomOverridePortForUnitTesting = true;
  configs.enableRestAuth = false;

  const domainRegistry = new DomainRegistry();
  domainRegistry.configManager = configs;
  domainRegistry.forwardNotificationUC = new ForwardNotificationUseCase(domainRegistry);

  const sensorRepo = new InMemSensorRepo();
  sensorRepo.saveSensor(new Sensor(1, 'sensor1'));
  domainRegistry.sensorRepo = sensorRepo;

  // Setup ClientManager
  domainRegistry.clientManager = new MockClientManager();

  domainRegistry.notificationRepo = new InMemNotificationRepo();

  const server = new ExpressServer(
    domainRegistry,
    new BSLogger('test-webhook-logger', { level: LogLevel.DEBUG })
  );

  let listeningPort: number;

  beforeAll((done) => {
    listeningPort = server.startListening(done);
  });

  afterAll((done) => {
    server.stopListening(done);
  });

  it('should propagate notification if request is correct', async () => {
    const resp = await axios.post(
      `http://localhost:${listeningPort}/notification-webhook`,
      {
        originSensorId: 1,
        header: 'Test',
        content: 'Test message',
      },
      {
        validateStatus: () => true,
      }
    );

    expect(resp.status).toEqual(200);
    expect(domainRegistry.clientManager.propagateNotifications).toBeCalled();
  });

  it('should return InvalidSensorId - 400 if sensor ID is invalid', async () => {
    const resp = await axios.post(
      `http://localhost:${listeningPort}/notification-webhook`,
      {
        originSensorId: 2,
        header: 'Test',
        content: 'Test message',
      },
      {
        validateStatus: () => true,
      }
    );

    expect(resp.status).toEqual(400);
    expect(resp.data.name).toEqual('InvalidSensorId');
  });
});
