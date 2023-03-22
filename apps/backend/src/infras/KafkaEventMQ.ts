import { Consumer, Kafka, logLevel } from 'kafkajs';
import { SensorReadEvent } from '../core/domain/SensorReadEvent';
import { EventMQ } from '../core/usecases/gateways/EventMQ';
import { IProcessReadEventUC } from '../core/usecases/ProcessReadEvent';

export class KafkaEventMQ implements EventMQ {
  private topicName: string;
  private consumer: Consumer;

  private processReadEventUC: IProcessReadEventUC;

  constructor(brokers: string[], topicName = 'chill-topic') {
    const kafka = new Kafka({
      clientId: 'chill-kafka-consumer',
      brokers: brokers,
      logLevel: logLevel.NOTHING,
    });

    this.consumer = kafka.consumer({
      groupId: 'chill-kafka-group',
    });

    this.topicName = topicName;
  }

  isSensorReadEvent(obj: unknown): obj is SensorReadEvent {
    return (
      obj &&
      typeof obj === 'object' &&
      typeof obj['sensorId'] === 'number' &&
      typeof obj['readTimestamp'] === 'string' &&
      obj['sensorValue'] &&
      typeof obj['sensorValue'] === 'object' &&
      typeof obj['sensorValue']['temperature'] === 'number' &&
      typeof obj['sensorValue']['humidity'] === 'number' &&
      typeof obj['sensorValue']['lightIntensity'] === 'number' &&
      typeof obj['sensorValue']['earthMoisture'] === 'number'
    );
  }

  async startListening() {
    await this.consumer.connect();
    await this.consumer.subscribe({ topic: this.topicName, fromBeginning: true });
    await this.consumer.run({
      eachMessage: async ({ message }) => {
        if (!this.processReadEventUC) return;

        const parsedMessage = JSON.parse(message.value.toString());
        if (!this.isSensorReadEvent(parsedMessage)) return;

        this.processReadEventUC.execute(parsedMessage);
      },
    });
  }

  async stopListening() {
    await this.consumer.stop();
    await this.consumer.disconnect();
  }

  onNewEvent(usecase: IProcessReadEventUC): void {
    this.processReadEventUC = usecase;
  }
}
