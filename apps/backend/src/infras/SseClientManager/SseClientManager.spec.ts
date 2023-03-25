import EventSource from 'eventsource';
import express from 'express';
import { Server } from 'http';
import { SseClientManager } from '.';
import { SensorReadEvent } from '../../core/domain/SensorReadEvent';
import { LogLevel } from '../../core/usecases/Logger';
import { BSLogger } from '../BSLogger';
import { sleep } from '../testingTools';

jest.setTimeout(10000);

describe('Unit test for SSE Client Manager', () => {
  const app = express();
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
    clientMgr = new SseClientManager({
      logger: new BSLogger('test-logger', { level: LogLevel.DEBUG }),
    });
    app.use('/streaming', clientMgr.getListeningRoute());
    server = app.listen(3000, done);
  });

  afterEach((done) => {
    clientMgr.stopListening();
    server.close(done);
  });

  test('subscribe should return an ClientId', (done) => {
    const clientId = clientMgr.generateNewClientId();
    clientMgr.openConnectionToClient(clientId);
    clientMgr.changeClientSubscription(clientId, [1]);

    const eventSource = new EventSource(`http://localhost:3000/streaming/${clientId}`);

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

    const eventSource1 = new EventSource(`http://localhost:3000/streaming/${clientId1}`);
    eventSource1.addEventListener('sensorEvent', (event) => {
      const sensorEvent = JSON.parse(event.data);
      es1Events.push(sensorEvent);
      eventSource1.close();
    });

    const clientId2 = clientMgr.generateNewClientId();
    clientMgr.openConnectionToClient(clientId2);
    clientMgr.changeClientSubscription(clientId2, [2]);

    const eventSource2 = new EventSource(`http://localhost:3000/streaming/${clientId2}`);
    eventSource2.addEventListener('sensorEvent', (event) => {
      const sensorEvent = JSON.parse(event.data);
      es2Events.push(sensorEvent);
      eventSource2.close();
    });

    sleep(1).then(() => {
      clientMgr.propagateSensorReadEvent(event1);
    });
    sleep(2).then(() => {
      clientMgr.propagateSensorReadEvent(event2);
    });

    sleep(4).then(() => {
      expect(es1Events).toContainEqual(event1);
      expect(es1Events).toContainEqual(event1);
      done();
    });
  });
});
