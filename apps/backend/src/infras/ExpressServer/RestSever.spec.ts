import { ExpressServer } from '.';
import { GetSensorListUseCase, GetSingleSensorUseCase } from '../../core/usecases';
import { InMemSensorRepo } from '../InMemSensorRepo';
import { sleep } from '../testingTools';
import fetch from 'node-fetch';
import { Sensor } from '../../core/domain/Sensor';

describe('Test REST API server', () => {
  const sensor1 = new Sensor(1, 'ABC');
  const sensorRepo = new InMemSensorRepo();
  sensorRepo.saveSensor(sensor1);

  const getSingleSensorUC = new GetSingleSensorUseCase(sensorRepo);
  const getSensorListUC = new GetSensorListUseCase(sensorRepo);

  const listeningPort = 3333;

  const server = new ExpressServer(listeningPort, getSingleSensorUC, getSensorListUC);

  beforeAll(async () => {
    server.startListening();
    await sleep(2);
  });

  afterAll(async () => {
    server.stopListening();
    await sleep(2);
  });

  test('Test get sensors of page 1', async () => {
    const resp = (await fetch('http://localhost:3333/sensors?pageNum=1')) as Response;
    const content = await resp.json();

    expect(content).not.toBeNull();
  });
});
