import express from 'express';
import { SensorReadEvent } from '../../core/domain/SensorReadEvent';
import { BSLogger } from '../BSLogger';
import { sleep } from '../testingTools';
import { RestClientManager } from './RestClientManager';
import fetch, { Response } from 'node-fetch';

jest.setTimeout(10000);

describe('Test REST Client Manager', () => {
  const event1: SensorReadEvent = {
    sensorId: 1,
    readTimestamp: new Date().toISOString(),
    sensorValue: {
      temperature: 1,
      humidity: 1,
      lightIntensity: 1,
      earthMoisture: 1,
    },
  };

  const event2: SensorReadEvent = {
    sensorId: 2,
    readTimestamp: new Date().toISOString(),
    sensorValue: {
      temperature: 2,
      humidity: 2,
      lightIntensity: 2,
      earthMoisture: 2,
    },
  };

  test('Test setup REST Client Manager', async () => {
    const clientManager = new RestClientManager(new BSLogger('dummy-logger', { target: '' }));

    const app = express();
    app.use('/streaming', clientManager.getRouter());
    const server = app.listen(3334);
    await sleep(2);

    const clientId = clientManager.generateNewClientId();
    clientManager.openConnectionToClient(clientId);
    clientManager.changeClientSubscription(clientId, [1]);

    clientManager.propagateSensorReadEvent(event1);

    const resp = (await fetch(`http://localhost:3334/streaming/events/${clientId}`)) as Response;
    const content = await resp.json();
    expect(content).toContainEqual(event1);

    server.close();
    await sleep(3);
  });

  test('Non-subscribed event should not received', async () => {
    const clientManager = new RestClientManager(new BSLogger('dummy-logger', { target: '' }));

    const app = express();
    app.use('/streaming', clientManager.getRouter());
    const server = app.listen(3334);
    await sleep(2);

    const clientId = clientManager.generateNewClientId();
    clientManager.openConnectionToClient(clientId);
    clientManager.changeClientSubscription(clientId, [1]);

    clientManager.propagateSensorReadEvent(event2);

    const resp = (await fetch(`http://localhost:3334/streaming/events/${clientId}`)) as Response;
    const content = await resp.json();
    expect(content).toHaveLength(0);

    server.close();
    await sleep(3);
  });

  test('Subscribed multiple sensorId should received all', async () => {
    const clientManager = new RestClientManager(new BSLogger('dummy-logger', { target: '' }));

    const app = express();
    app.use('/streaming', clientManager.getRouter());
    const server = app.listen(3334);
    await sleep(2);

    const clientId = clientManager.generateNewClientId();
    clientManager.openConnectionToClient(clientId);
    clientManager.changeClientSubscription(clientId, [1, 2]);

    clientManager.propagateSensorReadEvent(event1);
    clientManager.propagateSensorReadEvent(event2);

    const resp = (await fetch(`http://localhost:3334/streaming/events/${clientId}`)) as Response;
    const content = await resp.json();
    expect(content).toHaveLength(2);
    expect(content).toContainEqual(event1);
    expect(content).toContainEqual(event2);

    server.close();
    await sleep(3);
  });
});
