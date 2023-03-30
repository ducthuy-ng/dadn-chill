import axios from 'axios';
import { ExpressServer } from '.';
import { Sensor } from '../../core/domain/Sensor';
import { GetSensorListUseCase, GetSingleSensorUseCase } from '../../core/usecases';
import { ChangeSubscriptionUseCase } from '../../core/usecases/ChangeSubscription';
import { ClientSubscribeUseCase } from '../../core/usecases/StartClient';
import { BSLogger } from '../BSLogger';
import { InMemSensorRepo } from '../InMemSensorRepo';
import { DummySensorController } from './../DummySensorController';
import { RestClientManager } from './RestClientManager';

describe('Test REST API server', () => {
  const sensor1 = new Sensor(1, 'ABC');
  const sensorRepo = new InMemSensorRepo();
  sensorRepo.saveSensor(sensor1);

  const getSingleSensorUC = new GetSingleSensorUseCase(sensorRepo);
  const getSensorListUC = new GetSensorListUseCase(sensorRepo);

  const testLogger = new BSLogger('test sensor', { target: '' });

  const restClientManager = new RestClientManager(testLogger);
  const clientSubscribeUC = new ClientSubscribeUseCase(restClientManager);
  const changeSubscriptionUC = new ChangeSubscriptionUseCase(restClientManager);

  const sensorController = new DummySensorController();
  sensorController.prepareConnectionForSensor(1);

  const listeningPort = 3333;
  const server = new ExpressServer(
    listeningPort,
    getSingleSensorUC,
    getSensorListUC,
    clientSubscribeUC,
    changeSubscriptionUC,
    restClientManager,
    sensorController,
    testLogger
  );

  beforeAll((done) => {
    server.startListening(done);
  });

  afterAll((done) => {
    server.stopListening(done);
  });

  test('Test get sensors of page 1', async () => {
    const resp = await axios.get('http://localhost:3333/sensors?pageNum=1');
    expect(resp.data).not.toBeNull();
    expect(resp.data).toHaveLength(1);
  });

  test('missing query `pageNum` should return as page 1', async () => {
    const resp = await axios.get('http://localhost:3333/sensors');
    expect(resp.data).not.toBeNull();
    expect(resp.data).toHaveLength(1);
  });

  // ===================== /command =====================
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
    expect(resp.data.name).toEqual('FailedToForwardCommand');
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
