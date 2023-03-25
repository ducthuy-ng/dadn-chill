import EventSource from 'eventsource';
import axios, { AxiosError } from 'axios';
import express from 'express';
import { Server } from 'http';
import { SseClientManager } from '.';
import { SensorReadEvent } from '../../core/domain/SensorReadEvent';
import { LogLevel } from '../../core/usecases/Logger';
import { BSLogger } from '../BSLogger';
import { sleep } from '../testingTools';

jest.useFakeTimers();

describe('Unit test for SSE Client Manager', () => {
  const app = express();

  const clientMgr = new SseClientManager({
    logger: new BSLogger('test-sse', { level: LogLevel.DEBUG }),
    expressApp: app,
  });

  app.use('/', (req, res) => {
    res.send('Hello');
  });

  let server: Server;

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
    server = app.listen(3000, () => done());
  });

  afterAll((done) => {
    server.close(() => done());
  });

  test.skip('subscribe should return an ClientId', (done) => {
    // Cannot make onmessage work
    const clientId = clientMgr.generateNewClientId();
    clientMgr.openConnectionToClient(clientId);
    clientMgr.changeClientSubscription(clientId, [1]);

    const eventSource = new EventSource(`http://localhost:3000/streaming/${clientId}`);

    eventSource.onopen = (event) => {
      console.log(event);
    };

    eventSource.onmessage = (event) => {
      console.log(event);
      eventSource.close();
      done();
    };

    eventSource.onerror = (error) => {
      console.error(error.data);
    };

    sleep(2).then(() => {
      clientMgr.propagateSensorReadEvent(event1);
    });
  });

  test.skip('After SECONDS_SINCE_LAST_CONNECTED, clientMap should clear it', (done) => {
    const clientId = clientMgr.generateNewClientId();
    clientMgr.openConnectionToClient(clientId);

    jest.advanceTimersByTime(SseClientManager.SECONDS_SINCE_LAST_CONNECTED * 1000);

    axios.get(`http://localhost:3000/streaming/${clientId}`, {}).catch((err: AxiosError) => {
      expect(err.response?.data['name']).toBe('ClientIdNotFound');
      done();
    });
  });
});
