import axios from 'axios';
import { ExpressServer } from '.';
import { Sensor } from '../../core/domain/Sensor';
import { GetAnalysisDataForSensorUseCase } from '../../core/usecases';
import { GetTotalAnalysisDataUseCase } from '../../core/usecases/GetTotalAnalysisData';
import { LogLevel } from '../../core/usecases/Logger';
import { BSLogger } from '../BSLogger';
import { InMemConfigManager } from '../ConfigManager/InMemConfigManager';
import { DomainRegistry } from '../DomainRegistry';
import { InMemSensorRepo } from '../InMemSensorRepo';
import { PGRepository } from '../PGRepository';
import { RestClientManager } from './RestClientManager';

describe('Test statistic in REST API', () => {
  const configs = new InMemConfigManager();
  configs.randomOverridePortForUnitTesting = true;
  configs.enableRestAuth = false;

  const domainRegistry = new DomainRegistry();
  domainRegistry.configManager = configs;
  domainRegistry.getTotalStatisticUC = new GetTotalAnalysisDataUseCase(domainRegistry);
  domainRegistry.getAnalysisDataForSensorUC = new GetAnalysisDataForSensorUseCase(domainRegistry);

  const pgRepo = new PGRepository(
    {
      host: 'localhost',
      port: 5432,
      user: 'backend',
      password: 'password',
      database: 'backend',
    },
    new BSLogger('test-PGAnalysisTool', { level: LogLevel.DEBUG })
  );

  domainRegistry.analysisTool = pgRepo;
  domainRegistry.sensorRepo = new InMemSensorRepo();
  domainRegistry.sensorRepo.saveSensor(new Sensor(1, 'sensor 1'));

  const server = new ExpressServer(
    domainRegistry,
    new RestClientManager(new BSLogger('rest-client-manager-test', {})),
    new BSLogger('express-server-test', { level: LogLevel.DEBUG })
  );
  let listeningPort: number;

  beforeAll((done) => {
    listeningPort = server.startListening(done);
  });

  afterAll((done) => {
    pgRepo.disconnect().then(() => {
      server.stopListening(done);
    });
  });

  it('should exists /statistics route', async () => {
    const resp = await axios.post(
      `http://localhost:${listeningPort}/statistics`,
      {
        startDate: '2023-03-11',
        endDate: '2023-03-15',
      },
      {
        validateStatus: () => true,
      }
    );

    expect(resp.status).toEqual(200);

    expect(resp.data).toHaveProperty('temperatureHistory');
    expect(resp.data).toHaveProperty('humidityHistory');
    expect(resp.data).toHaveProperty('lightIntensityHistory');
    expect(resp.data).toHaveProperty('earthMoistureHistory');

    expect(resp.data['temperatureHistory']).toBeInstanceOf(Array);
    expect(resp.data['temperatureHistory'][0]).toHaveProperty('temperature');
    expect(resp.data['temperatureHistory'][0]).toHaveProperty('day');
    expect(resp.data['temperatureHistory'][0]['day']).toMatch(/\d{4}-\d{2}-\d{2}/);
  });

  it('should return error if missing body', async () => {
    const resp = await axios.post(
      `http://localhost:${listeningPort}/statistics`,
      {},
      {
        validateStatus: () => true,
      }
    );

    expect(resp.status).toEqual(400);
  });

  it('should exists /statistics/1 route', async () => {
    const resp = await axios.post(
      `http://localhost:${listeningPort}/statistics/1`,
      {
        startDate: '2023-03-11',
        endDate: '2023-03-15',
      },
      {
        validateStatus: () => true,
      }
    );

    expect(resp.status).toEqual(200);

    expect(resp.data).toHaveProperty('temperatureHistory');
    expect(resp.data).toHaveProperty('humidityHistory');
    expect(resp.data).toHaveProperty('lightIntensityHistory');
    expect(resp.data).toHaveProperty('earthMoistureHistory');

    expect(resp.data['temperatureHistory']).toBeInstanceOf(Array);
  });

  it('should throw error if param is a string ', async () => {
    const resp = await axios.post(
      `http://localhost:${listeningPort}/statistics/abc`,
      {
        startDate: '2023-03-11',
        endDate: '2023-03-15',
      },
      {
        validateStatus: () => true,
      }
    );

    expect(resp.status).toEqual(400);
  });

  it('should return 400 InvalidSensorId if sensor not exists ', async () => {
    const resp = await axios.post(
      `http://localhost:${listeningPort}/statistics/2`,
      {
        startDate: '2023-03-11',
        endDate: '2023-03-15',
      },
      {
        validateStatus: () => true,
      }
    );

    expect(resp.status).toEqual(400);
    expect(resp.data['name']).toEqual('InvalidSensorId');
  });
});
