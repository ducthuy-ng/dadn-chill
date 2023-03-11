import { InMemNotificationRepo } from '../../infras/InMemNotificationRepo';
import { InMemSensorRepo } from '../../infras/InMemSensorRepo';
import { ReadEventRepo } from '../domain/analysis/ReadEvent.repo';
import { ClientManager } from '../domain/ClientManager';
import { SensorIdNotFound } from '../domain/sensor/exception';
import { Sensor } from '../domain/sensor/sensor';
import { SensorReadEvent } from '../domain/sensor/sensorReadEvent';
import { SkipCheck } from '../domain/sensor/sensorReadEvent/middleware/SkipCheck';
import { GetSingleSensorUseCase } from '../usecases/GetSingleSensor';
import { ProcessReadEventUseCase } from './ProcessReadEvent';

class MockClientManager implements ClientManager {
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
  storeEvent = jest.fn((event: SensorReadEvent) => {
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

  it('Process ReadEvent, the read should have single sensor update', () => {
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
      sensorValue: {
        readTimestamp: new Date().toISOString(),
        temperature: 1,
        humidity: 2,
        lightIntensity: 3,
        windSpeed: 4,
      },
    };
    processEventUC.execute(event);
    const testSensor = getSingleSensorUC.execute(sensor1.getId());

    const sensorValue = testSensor.getReadValue();

    expect(sensorValue.temperature).toEqual(1);
    expect(sensorValue.humidity).toEqual(2);
    expect(sensorValue.lightIntensity).toEqual(3);
    expect(sensorValue.windSpeed).toEqual(4);

    expect(clientManager.propagateSensorReadEvent).toBeCalled();
    expect(clientManager.propagateNotifications).toBeCalled();
    expect(readEventRepo.storeEvent).toBeCalled();
  });

  it('Process ReadEvent but not affected the others', () => {
    const event1: SensorReadEvent = {
      sensorId: 1,
      sensorValue: {
        readTimestamp: new Date().toISOString(),
        temperature: 1,
        humidity: 2,
        lightIntensity: 3,
        windSpeed: 4,
      },
    };
    const event2: SensorReadEvent = {
      sensorId: 2,
      sensorValue: {
        readTimestamp: new Date().toISOString(),
        temperature: 100,
        humidity: 100,
        lightIntensity: 100,
        windSpeed: 100,
      },
    };

    processEventUC.execute(event1);
    expect(() => {
      processEventUC.execute(event2);
    }).toThrowError(SensorIdNotFound);
    const testSensor = getSingleSensorUC.execute(sensor1.getId());

    const sensorValue = testSensor.getReadValue();
    expect(sensorValue.temperature).toEqual(1);
    expect(sensorValue.humidity).toEqual(2);
    expect(sensorValue.lightIntensity).toEqual(3);
    expect(sensorValue.windSpeed).toEqual(4);

    expect(clientManager.propagateSensorReadEvent).toBeCalledTimes(1);
    expect(clientManager.propagateNotifications).toBeCalledTimes(1);
    expect(readEventRepo.storeEvent).toBeCalledTimes(1);
  });
});
