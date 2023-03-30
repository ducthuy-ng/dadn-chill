import EventSource from 'eventsource';
import express, { Application } from 'express';
import { Server } from 'http';
import { AddressInfo } from 'net';
import { SseClientManager } from '.';
import { Notification } from '../../core/domain/Notification';
import { Sensor } from '../../core/domain/Sensor';
import { SensorReadEvent } from '../../core/domain/SensorReadEvent';
import { LogLevel } from '../../core/usecases/Logger';
import { BSLogger } from '../BSLogger';
import { sleep } from '../testingTools';

jest.setTimeout(15000);

describe('Unit test for SSE Client Manager - PropagateNotification', () => {
  let app: Application;
  let server: Server;
  let clientMgr: SseClientManager;

  const sensor1 = new Sensor(1, 'sensor1');
  // const sensor2 = new Sensor(2, 'sensor2');

  const notification1 = Notification.generate(sensor1, 'Notification1', 'Notification test 1');
  // const notification2 = Notification.generate(sensor2, 'Notification2', 'Notification test 2');

  const notification1Dto = {
    id: notification1.id,
    idOfOriginSensor: notification1.idOfOriginSensor,
    nameOfOriginSensor: notification1.nameOfOriginSensor,

    createTimestamp: notification1.createdDate.toISOString(),

    header: notification1.header,
    content: notification1.content,
  };

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

  test('simple propagate should work', (done) => {
    const clientId = clientMgr.generateNewClientId();
    clientMgr.openConnectionToClient(clientId);
    clientMgr.changeClientSubscription(clientId, [1]);

    const serverAddress = server.address() as AddressInfo;

    const eventSource = new EventSource(
      `http://localhost:${serverAddress.port}/streaming/${clientId}`
    );

    eventSource.addEventListener('notification', (event) => {
      const sensorEvent = JSON.parse(event.data);
      expect(sensorEvent).toEqual(notification1Dto);
      eventSource.close();

      sleep(2).then(done);
    });

    sleep(1).then(() => {
      clientMgr.propagateNotifications([notification1]);
    });
  });

  test('both must receive all notifications', (done) => {
    const serverAddress = server.address() as AddressInfo;

    const es1Events = [];

    const clientId1 = clientMgr.generateNewClientId();
    clientMgr.openConnectionToClient(clientId1);
    const eventSource1 = new EventSource(
      `http://localhost:${serverAddress.port}/streaming/${clientId1}`
    );
    eventSource1.addEventListener('notification', (notification) => {
      console.log(notification);

      const sensorEvent = JSON.parse(notification.data);
      es1Events.push(sensorEvent);
    });

    const es2Events = [];
    const clientId2 = clientMgr.generateNewClientId();
    clientMgr.openConnectionToClient(clientId2);
    const eventSource2 = new EventSource(
      `http://localhost:${serverAddress.port}/streaming/${clientId2}`
    );
    eventSource2.addEventListener('notification', (notification) => {
      console.log(notification);

      const sensorEvent = JSON.parse(notification.data);
      es2Events.push(sensorEvent);
    });

    sleep(1).then(() => clientMgr.propagateNotifications([notification1]));

    sleep(2).then(() => {
      eventSource1.close();
      eventSource2.close();
    });

    sleep(3).then(() => {
      expect(es1Events).toContainEqual(notification1Dto);
      expect(es2Events).toContainEqual(notification1Dto);
      done();
    });
  });

  test('propagate both types of event should still work', (done) => {
    const clientId1 = clientMgr.generateNewClientId();
    clientMgr.openConnectionToClient(clientId1);
    clientMgr.changeClientSubscription(clientId1, [1]);

    const serverAddress = server.address() as AddressInfo;
    const eventSource1 = new EventSource(
      `http://localhost:${serverAddress.port}/streaming/${clientId1}`
    );

    const es1Events = [];
    eventSource1.addEventListener('sensorEvent', (event) => {
      console.log(event);

      const sensorEvent = JSON.parse(event.data);
      es1Events.push(sensorEvent);
    });

    const es1Notifications = [];
    eventSource1.addEventListener('notification', (notification) => {
      console.log(notification);
      const parseNotification = JSON.parse(notification.data);
      es1Notifications.push(parseNotification);
    });

    sleep(1).then(() => {
      clientMgr.propagateSensorReadEvent(event1);
      clientMgr.propagateNotifications([notification1]);
    });

    sleep(2).then(() => {
      eventSource1.close();
    });

    sleep(3).then(() => {
      expect(es1Events).toContainEqual(event1);
      expect(es1Notifications).toContainEqual(notification1Dto);
      done();
    });
  });
});
