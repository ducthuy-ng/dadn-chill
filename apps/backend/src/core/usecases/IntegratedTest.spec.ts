import { InMemNotificationRepo } from '../../infras/InMemNotificationRepo';
import { InMemSensorRepo } from '../../infras/InMemSensorRepo';
import { SkipCheck } from '../domain/LimitChecker/SkipCheck';
import { Sensor } from '../domain/Sensor';
import { ClientId, ClientManager } from './gateways/ClientManager';
import { SensorReadEvent } from '../domain/SensorReadEvent';
import { GetSingleSensorUseCase } from '../usecases/GetSingleSensor';
import { ProcessReadEventUseCase } from './ProcessReadEvent';
import { SensorIdNotFound } from './repos/SensorRepo';
import { ReadEventRepo } from './repos/ReadEventRepo';

class MockClientManager implements ClientManager {
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

class MockReadEventRepo implements ReadEventRepo {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  storeEvent = jest.fn(async(event: SensorReadEvent) => {
    return;
  });
}

describe('Test Single Sensor Data Request', () => {
  let sensor1: Sensor;
  let sensorRepo: InMemSensorRepo;

  const notificationRepo = new InMemNotificationRepo();
  const clientManager = new MockClientManager();
  const readEventRepo = new MockReadEventRepo();

  let processEventUC: ProcessReadEventUseCase;
  let getSingleSensorUC: GetSingleSensorUseCase;

  beforeEach(() => {
    sensorRepo = new InMemSensorRepo();
    sensor1 = new Sensor(1, 'ABC');
    sensorRepo.saveSensor(sensor1);

    processEventUC = new ProcessReadEventUseCase(
      sensorRepo,
      notificationRepo,
      new SkipCheck(),
      clientManager,
      readEventRepo
    );

    getSingleSensorUC = new GetSingleSensorUseCase(sensorRepo);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Process ReadEvent, the read should have single sensor update', async () => {
    const processEventUC = new ProcessReadEventUseCase(
      sensorRepo,
      notificationRepo,
      new SkipCheck(),
      clientManager,
      readEventRepo
    );

    const getSingleSensorUC = new GetSingleSensorUseCase(sensorRepo);

    const event: SensorReadEvent = {
      sensorId: 1,
      readTimestamp: new Date().toISOString(),
      sensorValue: {
        temperature: 1,
        humidity: 2,
        lightIntensity: 3,
        earthMoisture: 4,
      },
    };
    processEventUC.execute(event);
    const testSensor = await getSingleSensorUC.execute(sensor1.getId());

    const sensorValue = testSensor.getReadValue();

    expect(sensorValue.temperature).toEqual(1);
    expect(sensorValue.humidity).toEqual(2);
    expect(sensorValue.lightIntensity).toEqual(3);
    expect(sensorValue.earthMoisture).toEqual(4);

    expect(clientManager.propagateSensorReadEvent).toBeCalled();
    expect(clientManager.propagateNotifications).toBeCalled();
    expect(readEventRepo.storeEvent).toBeCalled();
  });

  it('Process ReadEvent but not affected the others', async () => {
    const event1: SensorReadEvent = {
      sensorId: 1,
      readTimestamp: new Date().toISOString(),
      sensorValue: {
        temperature: 1,
        humidity: 2,
        lightIntensity: 3,
        earthMoisture: 4,
      },
    };
    const event2: SensorReadEvent = {
      sensorId: 2,
      readTimestamp: new Date().toISOString(),
      sensorValue: {
        temperature: 100,
        humidity: 100,
        lightIntensity: 100,
        earthMoisture: 100,
      },
    };

    processEventUC.execute(event1);
    expect(() => {
      processEventUC.execute(event2);
    }).toThrowError(SensorIdNotFound);
    const testSensor = await getSingleSensorUC.execute(sensor1.getId());

    const sensorValue = testSensor.getReadValue();
    expect(sensorValue.temperature).toEqual(1);
    expect(sensorValue.humidity).toEqual(2);
    expect(sensorValue.lightIntensity).toEqual(3);
    expect(sensorValue.earthMoisture).toEqual(4);

    expect(clientManager.propagateSensorReadEvent).toBeCalledTimes(1);
    expect(clientManager.propagateNotifications).toBeCalledTimes(1);
    expect(readEventRepo.storeEvent).toBeCalledTimes(1);
  });
});
