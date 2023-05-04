import axios from 'axios';
import { randomUUID } from 'crypto';
import { ExpressServer } from '.';
import { GetAllSensorUseCase } from '../../core/usecases';
import { LogLevel } from '../../core/usecases/Logger';
import { LoginUseCase } from '../../core/usecases/Login';
import { BSLogger } from '../BSLogger';
import { InMemConfigManager } from '../ConfigManager/InMemConfigManager';
import { DomainRegistry } from '../DomainRegistry';
import { InMemSensorRepo } from '../InMemSensorRepo';
import { InMemUserRepo } from '../InMemUserRepo';
import { sleep } from '../testingTools';

jest.setTimeout(10000);

describe('Test setup authentication in REST Server', () => {
  let configs: InMemConfigManager;
  let domainRegistry: DomainRegistry;

  beforeAll(() => {
    configs = new InMemConfigManager();
    configs.randomOverridePortForUnitTesting = true;

    domainRegistry = new DomainRegistry();
    domainRegistry.configManager = configs;

    const sensorRepo = new InMemSensorRepo();
    domainRegistry.getAllSensorsUC = new GetAllSensorUseCase(sensorRepo);

    domainRegistry.loginUC = new LoginUseCase(domainRegistry);
  });

  test('If enable auth, fetch a restricted resource should return 401', async () => {
    configs.enableRestAuth = true;

    const server = new ExpressServer(domainRegistry, new BSLogger('express-server-test', {}));

    const listeningPort = server.startListening();
    await sleep(2);

    const resp = await axios.get(`http://localhost:${listeningPort}/sensors`, {
      validateStatus: () => true,
    });

    server.stopListening();
    await sleep(2);

    expect(resp.status).toEqual(401);
    expect(resp.headers['www-authenticate']).toEqual('basic');
  });

  test('If disable auth, fetch a restricted resource should success', async () => {
    configs.enableRestAuth = false;

    const server = new ExpressServer(domainRegistry, new BSLogger('express-server-test', {}));

    const listeningPort = server.startListening();
    await sleep(2);

    const resp = await axios.get(`http://localhost:${listeningPort}/sensors`, {
      validateStatus: () => true,
    });

    server.stopListening();
    await sleep(2);

    expect(resp.status).toEqual(200);
    expect(resp.data).toBeInstanceOf(Array);
  });

  test('If disable auth, route `/auth` should not exists', async () => {
    configs.enableRestAuth = false;

    const server = new ExpressServer(domainRegistry, new BSLogger('express-server-test', {}));

    const listeningPort = server.startListening();
    await sleep(2);

    const resp = await axios.post(
      `http://localhost:${listeningPort}/auth/login`,
      {},
      {
        validateStatus: () => true,
      }
    );

    server.stopListening();
    await sleep(2);

    expect(resp.status).toEqual(404);
  });
});

describe('Test authentication in REST server', () => {
  const configs = new InMemConfigManager();
  configs.randomOverridePortForUnitTesting = true;
  configs.enableRestAuth = true;

  const userRepo = new InMemUserRepo();

  const domainRegistry = new DomainRegistry();
  domainRegistry.configManager = configs;
  domainRegistry.userRepo = userRepo;

  const sensorRepo = new InMemSensorRepo();
  domainRegistry.getAllSensorsUC = new GetAllSensorUseCase(sensorRepo);
  domainRegistry.loginUC = new LoginUseCase(domainRegistry);

  const server = new ExpressServer(
    domainRegistry,
    new BSLogger('express-server-test', { level: LogLevel.DEBUG })
  );

  let listeningPort: number;

  beforeAll((done) => {
    listeningPort = server.startListening(done);
  });

  afterAll((done) => {
    server.stopListening(done);
  });

  it('should return a token if login with valid credential', async () => {
    const resp = await axios.post(
      `http://localhost:${listeningPort}/auth/login`,
      {
        email: 'nguyen.thuy@gmail.com',
        password: 'password',
      },
      {
        validateStatus: () => true,
      }
    );

    expect(resp.status).toEqual(200);
    expect(resp.headers).toHaveProperty('x-api-key');
    expect(resp.headers['x-api-key']).not.toBeNull();
  });

  it('should response 400 if login with invalid credential', async () => {
    const resp = await axios.post(
      `http://localhost:${listeningPort}/auth/login`,
      {
        email: 'nguyen.thuy23@gmail.com',
        password: 'password',
      },
      {
        validateStatus: () => true,
      }
    );

    expect(resp.status).toEqual(400);
    expect(resp.data).toHaveProperty('name');
    expect(resp.data.name).toEqual('InvalidCredential');
  });

  it('should response 400 if x-api-key is not registered', async () => {
    const resp = await axios.get(`http://localhost:${listeningPort}/auth/logout`, {
      headers: {
        'x-api-key': randomUUID(),
      },
      validateStatus: () => true,
    });

    expect(resp.status).toEqual(400);
    expect(resp.data.name).toEqual('InvalidApiToken');
  });

  it('should correctly remove token if logout', async () => {
    const loginResp = await axios.post(
      `http://localhost:${listeningPort}/auth/login`,
      {
        email: 'nguyen.thuy@gmail.com',
        password: 'password',
      },
      {
        validateStatus: () => true,
      }
    );
    const apiKey = loginResp.headers['x-api-key'];

    await axios.get(`http://localhost:${listeningPort}/auth/logout`, {
      headers: {
        'x-api-key': apiKey,
      },
    });

    const restrictedResourcesResp = await axios.get(`http://localhost:${listeningPort}/sensors`, {
      headers: {
        'x-api-key': apiKey,
      },
      validateStatus: () => true,
    });
    expect(restrictedResourcesResp.status).toEqual(401);
  });

  it('should revoke token after 30 minutes', async () => {
    jest.useFakeTimers();

    const resp = await axios.post(
      `http://localhost:${listeningPort}/auth/login`,
      {
        email: 'nguyen.thuy@gmail.com',
        password: 'password',
      },
      {
        validateStatus: () => true,
        timeout: 1000,
      }
    );

    jest.advanceTimersByTime(40 * 60 * 1000);
    jest.useRealTimers();

    const apiKey = resp.headers['x-api-key'];

    const restrictedResourcesResp = await axios.get(`http://localhost:${listeningPort}/sensors`, {
      validateStatus: () => true,
      headers: {
        'x-api-key': apiKey,
      },
    });

    expect(restrictedResourcesResp.status).toEqual(401);
  });

  it('should allow access restricted resources if have correct token', async () => {
    const resp = await axios.post(
      `http://localhost:${listeningPort}/auth/login`,
      {
        email: 'nguyen.thuy@gmail.com',
        password: 'password',
      },
      {
        validateStatus: () => true,
      }
    );

    const apiKey = resp.headers['x-api-key'];

    const restrictedResourcesResp = await axios.get(`http://localhost:${listeningPort}/sensors`, {
      validateStatus: () => true,
      headers: {
        'x-api-key': apiKey,
      },
    });
    await axios.get(`http://localhost:${listeningPort}/auth/logout`, {
      headers: {
        'x-api-key': apiKey,
      },
    });

    expect(restrictedResourcesResp.status).toEqual(200);
    expect(restrictedResourcesResp.data).toBeInstanceOf(Array);
  });

  it('should not allow accessing restricted resources if token is invalid', async () => {
    const restrictedResourcesResp = await axios.get(`http://localhost:${listeningPort}/sensors`, {
      validateStatus: () => true,
      headers: {
        'x-api-key': randomUUID(),
      },
    });

    expect(restrictedResourcesResp.status).toEqual(401);
  });
});
