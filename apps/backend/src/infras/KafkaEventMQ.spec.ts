import { Kafka, logLevel } from 'kafkajs';
import { SensorReadEvent } from '../core/domain/SensorReadEvent';
import { KafkaEventMQ } from './KafkaEventMQ';
import { sleep } from './testingTools';

jest.setTimeout(10000);

describe('Kafka event MQ testing', () => {
  const testKafkaBrokers = ['localhost:9092'];
  const testTopicName = 'test-topic';
  const kafka = new Kafka({ brokers: testKafkaBrokers, logLevel: logLevel.NOTHING });

  const admin = kafka.admin();

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
    await admin.connect();
    await admin.createTopics({
      topics: [{ topic: testTopicName }],
    });
    await admin.disconnect();
    await sleep(2);
  });

  afterAll(async () => {
    await admin.connect();
    await admin.deleteTopics({
      topics: [testTopicName],
    });
    await admin.disconnect();
    await sleep(2);
  });

  test('Test isSensorReadEvent checker', () => {
    const message =
      '{"sensorId":1,"readTimestamp":"2023-03-16T11:21:36.167Z","sensorValue":{"temperature":1,"humidity":1,"lightIntensity":1,"earthMoisture":1}}';
    const parsedMessage = JSON.parse(message);
    const eventMQ = new KafkaEventMQ(['localhost:9092'], testTopicName);

    expect(eventMQ.isSensorReadEvent(parsedMessage)).toBeTruthy();
  });

  test('Simple creation test', async () => {
    const kafkaProducer = kafka.producer({ allowAutoTopicCreation: true });
    await kafkaProducer.connect();
    await kafkaProducer.send({
      topic: testTopicName,
      messages: [{ value: JSON.stringify(event1) }, { value: JSON.stringify(event2) }],
    });
    await kafkaProducer.disconnect();

    const receivedMessages = [];
    const storeEvent = jest.fn((event: SensorReadEvent) => {
      receivedMessages.push(event);
    });

    const eventMQ = new KafkaEventMQ(['localhost:9092'], testTopicName);
    eventMQ.onNewEvent(storeEvent);
    eventMQ.startListening();

    await sleep(2);

    expect(receivedMessages).toContainEqual(event1);
    expect(receivedMessages).toContainEqual(event2);

    await eventMQ.stopListening();
  });
});
