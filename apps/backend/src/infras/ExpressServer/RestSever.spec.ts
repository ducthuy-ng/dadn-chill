import axios, { AxiosError } from 'axios';
import { ExpressServer } from '.';
import { Notification } from '../../core/domain/Notification';
import { Sensor } from '../../core/domain/Sensor';
import { GetAllSensorUseCase, GetSingleSensorUseCase } from '../../core/usecases';
import { ChangeSubscriptionUseCase } from '../../core/usecases/ChangeSubscription';
import { GetAllNotificationsUseCase } from '../../core/usecases/GetAllNotifications';
import { LogLevel } from '../../core/usecases/Logger';
import { ClientSubscribeUseCase } from '../../core/usecases/StartClient';
import { BSLogger } from '../BSLogger';
import { InMemConfigManager } from '../ConfigManager/InMemConfigManager';
import { DomainRegistry } from '../DomainRegistry';
import { InMemNotificationRepo } from '../InMemNotificationRepo';
import { InMemSensorRepo } from '../InMemSensorRepo';
import { DummySensorController } from './../DummySensorController';
import { convertToNotificationDto, NotificationDto } from './NotificationDto';
import { RestClientManager } from './RestClientManager';
import { GenerateDto, SensorDto } from './SensorDto';

// ======================== Create dummy ========================
const sensorRepo = new InMemSensorRepo();
const notificationRepo = new InMemNotificationRepo();

const sensor1 = new Sensor(1, 'ABC');
const sensor2 = new Sensor(2, 'DEF');

sensorRepo.saveSensor(sensor1);
sensorRepo.saveSensor(sensor2);

const sensor1Dto = GenerateDto(sensor1);
const sensor2Dto = GenerateDto(sensor2);

const notification1 = Notification.generate(sensor1, 'Notification1', 'Test Notification1');
const notification2 = Notification.generate(sensor1, 'Notification2', 'Test Notification2');

const notification1Dto = convertToNotificationDto(notification1);
const notification2Dto = convertToNotificationDto(notification2);

notificationRepo.add(notification1);
notificationRepo.add(notification2);

// ======================== Create use cases and infrastructures ========================

DomainRegistry.Instance.getSingleSensorUC = new GetSingleSensorUseCase(sensorRepo);
DomainRegistry.Instance.getAllSensorsUC = new GetAllSensorUseCase(sensorRepo);
DomainRegistry.Instance.getAllNotificationsUC = new GetAllNotificationsUseCase(notificationRepo);

const testLogger = new BSLogger('test sensor', { level: LogLevel.DEBUG });

const restClientManager = new RestClientManager(testLogger);
DomainRegistry.Instance.subscribeClientUC = new ClientSubscribeUseCase(restClientManager);
DomainRegistry.Instance.changeClientSubscriptionUC = new ChangeSubscriptionUseCase(
  restClientManager
);

const configs = new InMemConfigManager();
configs.ExpressListeningPort = 3333;
DomainRegistry.Instance.configManager = configs;

const sensorController = new DummySensorController();
sensorController.prepareConnectionForSensor(1);
DomainRegistry.Instance.sensorController = sensorController;

const server = new ExpressServer(restClientManager, testLogger);

beforeAll((done) => {
  server.startListening(done);
});

afterAll((done) => {
  server.stopListening(done);
});

describe('Test /health-check routes', () => {
  test('Simple get should return 200', async () => {
    const response = await axios.get('http://localhost:3333/health-check');
    expect(response.status).toEqual(200);
  });
});

describe('Test /sensors routes', () => {
  test('Simple get all sensors should work', async () => {
    const resp = await axios.get<SensorDto[]>('http://localhost:3333/sensors?offset=1&limit=1');

    const resultDto = resp.data;
    expect(resultDto).toHaveLength(1);
    expect(resultDto).toContainEqual(sensor2Dto);

    expect(resp.headers).toHaveProperty('x-content-size');
    expect(parseInt(resp.headers['x-content-size'])).toEqual(2);
  });

  test('Missing query should default to offset=0 and limit=10', async () => {
    for (let i = 3; i <= 12; ++i) sensorRepo.saveSensor(new Sensor(i, `dummy-sensor-name-${i}`));

    const resp = await axios.get<SensorDto[]>('http://localhost:3333/sensors');
    const resultDto = resp.data;

    sensorRepo.clean();
    sensorRepo.saveSensor(sensor1);
    sensorRepo.saveSensor(sensor2);

    expect(resultDto).toHaveLength(10);
    expect(resultDto).toContainEqual(sensor1Dto);
    expect(resultDto).toContainEqual(sensor2Dto);
  });

  test('offset equal to total count should return empty', async () => {
    const resp = await axios.get<SensorDto[]>('http://localhost:3333/sensors?offset=2');

    const resultDto = resp.data;
    expect(resultDto).toHaveLength(0);
  });

  test('Invalid query should throw error', async () => {
    try {
      await axios.get<SensorDto[]>('http://localhost:3333/sensors?offset=b');
      throw new Error();
    } catch (err) {
      if (!(err instanceof AxiosError)) throw new Error();

      expect(err.response.status).toEqual(400);
      expect(err.response.data).toHaveProperty('name');
      expect(err.response.data['name']).toEqual('ValidationError');
    }
  });
});

describe('Test /command route', () => {
  test('Simple command send should work', async () => {
    const resp = await axios.post('http://localhost:3333/command', {
      sensorId: 1,
      details: 1,
    });

    expect(resp.status).toEqual(200);
  });

  test('Send command to non-register sensor should fail', async () => {
    const resp = await axios.post(
      'http://localhost:3333/command',
      {
        sensorId: 2,
        details: 1,
      },
      { validateStatus: () => true }
    );

    expect(resp.status).toEqual(400);
    expect(resp.data.name).toEqual('RequestSensorIdNotConnect');
  });

  test('Validation should occurred before forwarding', async () => {
    const resp = await axios.post(
      'http://localhost:3333/command',
      {
        sensorId: 2,
        details: '1',
      },
      { validateStatus: () => true }
    );

    expect(resp.status).toEqual(400);
    expect(resp.data.name).toEqual('InvalidPropertyType');
  });
});

describe('Test /notification routes', () => {
  test('Simple get all notifications should work', async () => {
    const resp = await axios.get<NotificationDto[]>(
      'http://localhost:3333/notifications?offset=0&limit=1'
    );

    const resultDto = resp.data;
    expect(resultDto).toHaveLength(1);
    expect(resultDto).toContainEqual(notification1Dto);

    expect(resp.headers).toHaveProperty('x-content-size');
    expect(parseInt(resp.headers['x-content-size'])).toEqual(2);
  });

  test('Missing query should default to offset=0 and limit=10', async () => {
    for (let i = 1; i <= 10; ++i)
      notificationRepo.add(
        Notification.generate(sensor1, 'test notification', 'dummy notifications')
      );

    const resp = await axios.get<NotificationDto[]>('http://localhost:3333/notifications');
    const resultDto = resp.data;

    notificationRepo.clean();
    notificationRepo.add(notification1);
    notificationRepo.add(notification2);

    expect(resultDto).toHaveLength(10);
    expect(resultDto).toContainEqual(notification1Dto);
    expect(resultDto).toContainEqual(notification2Dto);
  });

  test('offset equal to total count should return empty', async () => {
    const resp = await axios.get<NotificationDto[]>('http://localhost:3333/notifications?offset=2');

    const resultDto = resp.data;
    expect(resultDto).toHaveLength(0);
  });

  test('Invalid query should throw error', async () => {
    const response = await axios.get<NotificationDto[]>(
      'http://localhost:3333/notifications?limit=a',
      {
        validateStatus: () => true,
      }
    );

    expect(response.status).toEqual(400);
    expect(response.data).toHaveProperty('name');
    expect(response.data['name']).toEqual('ValidationError');
  });
});
