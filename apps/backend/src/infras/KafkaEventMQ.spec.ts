import { Kafka, logLevel } from 'kafkajs';
import { SensorReadEvent } from '../core/domain/SensorReadEvent';
import { IProcessReadEventUC } from '../core/usecases/ProcessReadEvent';
import { KafkaEventMQ } from './KafkaEventMQ';
import { sleep } from './testingTools';

jest.setTimeout(15000);

class DummyProcessReadEvent implements IProcessReadEventUC {
  public receivedMessages = [];

  execute = jest.fn((event: SensorReadEvent) => {
    this.receivedMessages.push(event);
  });
}

describe.skip('Kafka event MQ testing', () => {
  const testKafkaBrokers = ['localhost:9092'];
  const testTopicName = 'test-topic';
  const kafka = new Kafka({ brokers: testKafkaBrokers, logLevel: logLevel.NOTHING });

  const admin = kafka.admin();

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
    await admin.connect();
    await admin.createTopics({
      topics: [{ topic: testTopicName }],
    });
    await admin.disconnect();
    await sleep(1);
  });

  afterAll(async () => {
    await admin.connect();
    await admin.deleteTopics({
      topics: [testTopicName],
    });
    await admin.disconnect();
    await sleep(1);
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

    const eventMQ = new KafkaEventMQ(['localhost:9092'], testTopicName);
    eventMQ.onNewEvent(dummyProcessEventUC);
    eventMQ.startListening();

    await sleep(2);

    expect(dummyProcessEventUC.receivedMessages).toContainEqual(event1);
    expect(dummyProcessEventUC.receivedMessages).toContainEqual(event2);

    await eventMQ.stopListening();
  });
});
