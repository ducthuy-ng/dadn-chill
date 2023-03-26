import axios, { AxiosError } from 'axios';
import EventSource from 'eventsource';
import express, { Application } from 'express';
import { Server } from 'http';
import { AddressInfo } from 'net';
import { SseClientManager } from '.';
import { SensorReadEvent } from '../../core/domain/SensorReadEvent';
import { LogLevel } from '../../core/usecases/Logger';
import { BSLogger } from '../BSLogger';
import { sleep } from '../testingTools';

jest.setTimeout(10000);

describe('Unit test for SSE Client Manager', () => {
  let app: Application;
  let server: Server;
  let clientMgr: SseClientManager;

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

  beforeEach((done) => {
    app = express();
    clientMgr = new SseClientManager({
      logger: new BSLogger('test-logger', { level: LogLevel.DEBUG }),
    });
    app.use('/streaming', clientMgr.getListeningRouter());
    server = app.listen(done);
  });

  afterEach((done) => {
    clientMgr.stopListening();
    server.close(done);
  });

  test('subscribe should return an ClientId', (done) => {
    const clientId = clientMgr.generateNewClientId();
    clientMgr.openConnectionToClient(clientId);
    clientMgr.changeClientSubscription(clientId, [1]);

    const serverAddress = server.address() as AddressInfo;

    const eventSource = new EventSource(
      `http://localhost:${serverAddress.port}/streaming/${clientId}`
    );

    eventSource.addEventListener('sensorEvent', (event) => {
      const sensorEvent = JSON.parse(event.data);
      expect(sensorEvent).toEqual(event1);
      eventSource.close();

      sleep(2).then(done);
    });

    sleep(1).then(() => {
      clientMgr.propagateSensorReadEvent(event1);
    });
  });

  test('different subscription should not receive different events', (done) => {
    const clientId1 = clientMgr.generateNewClientId();
    clientMgr.openConnectionToClient(clientId1);
    clientMgr.changeClientSubscription(clientId1, [1]);

    const es1Events = [];
    const es2Events = [];

    const serverAddress = server.address() as AddressInfo;

    const eventSource1 = new EventSource(
      `http://localhost:${serverAddress.port}/streaming/${clientId1}`
    );
    eventSource1.addEventListener('sensorEvent', (event) => {
      const sensorEvent = JSON.parse(event.data);
      es1Events.push(sensorEvent);
      eventSource1.close();
    });

    const clientId2 = clientMgr.generateNewClientId();
    clientMgr.openConnectionToClient(clientId2);
    clientMgr.changeClientSubscription(clientId2, [2]);

    const eventSource2 = new EventSource(
      `http://localhost:${serverAddress.port}/streaming/${clientId2}`
    );
    eventSource2.addEventListener('sensorEvent', (event) => {
      const sensorEvent = JSON.parse(event.data);
      es2Events.push(sensorEvent);
      eventSource2.close();
    });

    sleep(2).then(() => {
      clientMgr.propagateSensorReadEvent(event1);
    });
    sleep(3).then(() => {
      clientMgr.propagateSensorReadEvent(event2);
    });

    sleep(4).then(() => {
      expect(es1Events).toContainEqual(event1);
      expect(es2Events).toContainEqual(event2);
      done();
    });
  });

  test('same subscriptions should receive same event', (done) => {
    const clientId1 = clientMgr.generateNewClientId();
    clientMgr.openConnectionToClient(clientId1);
    clientMgr.changeClientSubscription(clientId1, [1]);

    const es1Events = [];
    const es2Events = [];

    const serverAddress = server.address() as AddressInfo;

    const eventSource1 = new EventSource(
      `http://localhost:${serverAddress.port}/streaming/${clientId1}`
    );
    eventSource1.addEventListener('sensorEvent', (event) => {
      const sensorEvent = JSON.parse(event.data);
      es1Events.push(sensorEvent);
      eventSource1.close();
    });

    const clientId2 = clientMgr.generateNewClientId();
    clientMgr.openConnectionToClient(clientId2);
    clientMgr.changeClientSubscription(clientId2, [1]);

    const eventSource2 = new EventSource(
      `http://localhost:${serverAddress.port}/streaming/${clientId2}`
    );
    eventSource2.addEventListener('sensorEvent', (event) => {
      const sensorEvent = JSON.parse(event.data);
      es2Events.push(sensorEvent);
      eventSource2.close();
    });

    sleep(2).then(() => {
      clientMgr.propagateSensorReadEvent(event1);
    });

    sleep(4).then(() => {
      expect(es1Events).toContainEqual(event1);
      expect(es2Events).toContainEqual(event1);
      done();
    });
  });
});

describe('Unit test for setTimeOut', () => {
  const clientMgr = new SseClientManager({
    logger: new BSLogger('test-logger', { level: LogLevel.DEBUG }),
  });

  const app = express();
  app.use('/streaming', clientMgr.getListeningRouter());

  let server: Server;

  beforeAll((done) => {
    jest.useFakeTimers();
    server = app.listen(3000, done);
  });

  afterAll((done) => {
    jest.useRealTimers();
    server.close(done);
  });

  test('After SECONDS_SINCE_LAST_CONNECTED, clientMap should clear it', (done) => {
    const clientId = clientMgr.generateNewClientId();
    clientMgr.openConnectionToClient(clientId);

    jest.advanceTimersByTime(SseClientManager.SECONDS_SINCE_LAST_CONNECTED * 1000 + 5);

    axios
      .get(`http://localhost:3000/streaming/${clientId}`, {})
      .then((resp) => fail(resp.status))
      .catch((err: AxiosError) => {
        expect(err.response?.data['name']).toBe('ClientIdNotFound');
        done();
      });
  });
});
