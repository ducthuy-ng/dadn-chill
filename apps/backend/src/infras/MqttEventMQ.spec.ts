import { LogLevel } from '../core/usecases/Logger';
import { BSLogger } from './BSLogger';
import { MqttEventMQ } from './MqttEventMQ';
import { sleep } from './testingTools';
import * as mqtt from 'async-mqtt';
import { SensorReadEvent } from '../core/domain/SensorReadEvent';
import { IProcessReadEventUC } from '../core/usecases/ProcessReadEvent';

jest.setTimeout(10000);

class DummyProcessReadEvent implements IProcessReadEventUC {
  public receivedMessages = [];

  execute = jest.fn((event: SensorReadEvent) => {
    this.receivedMessages.push(event);
  });
}

describe('Test MQTT Event MQ', () => {
  let mqttClient: mqtt.AsyncMqttClient;
  const testTopicName = 'test-topic';
  const dummyProcessEventUC = new DummyProcessReadEvent();

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

  beforeAll(async () => {
    mqttClient = mqtt.connect('mqtt://localhost:1883');
    await sleep(2);
  });

  afterAll(async () => {
    mqttClient.end(true);
    await sleep(2);
  });

  test('Test isSensorReadEvent checker', () => {
    const message =
      '{"sensorId":1,"readTimestamp":"2023-03-16T11:21:36.167Z","sensorValue":{"temperature":1,"humidity":1,"lightIntensity":1,"earthMoisture":1}}';
    const parsedMessage = JSON.parse(message);
    const dummyLogger = new BSLogger('eventMQ logger', { level: LogLevel.DEBUG });
    const eventMQ = new MqttEventMQ('mqtt://localhost:1883', testTopicName, dummyLogger);

    expect(eventMQ.isSensorReadEvent(parsedMessage)).toBeTruthy();
  });

  test('Start test', async () => {
    const dummyLogger = new BSLogger('eventMQ logger', { level: LogLevel.DEBUG });
    const eventMQ = new MqttEventMQ('mqtt://localhost:1883', testTopicName, dummyLogger);

    eventMQ.onNewEvent(dummyProcessEventUC);
    await eventMQ.startListening();

    await mqttClient.publish(testTopicName, JSON.stringify(event1));
    await mqttClient.publish(testTopicName, JSON.stringify(event2));
    await sleep(2);

    await eventMQ.stopListening();
    expect(dummyProcessEventUC.receivedMessages).toHaveLength(2);
    expect(dummyProcessEventUC.receivedMessages).toContainEqual(event1);
    expect(dummyProcessEventUC.receivedMessages).toContainEqual(event2);
  });
});
