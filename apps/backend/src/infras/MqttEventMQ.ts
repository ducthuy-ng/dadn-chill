import * as mqtt from 'async-mqtt';
import { SensorReadEvent } from '../core/domain/SensorReadEvent';
import { EventMQ } from '../core/usecases/gateways/EventMQ';
import { Logger } from '../core/usecases/Logger';
import { IProcessReadEventUC } from '../core/usecases/ProcessReadEvent';

export class MqttEventMQ implements EventMQ {
  private processReadEventUC: IProcessReadEventUC;
  private client: mqtt.AsyncMqttClient;
  private subscribeTopic: string;

  private logger: Logger;

  constructor(mqttEndPoint: string, subscribeTopic: string, logger: Logger) {
    this.logger = logger;

    this.logger.info('Connecting to MQTT server');
    this.client = mqtt.connect(mqttEndPoint);

    this.subscribeTopic = subscribeTopic;

    this.client.on('message', (_topic, payload) => {
      if (!this.processReadEventUC) return;
      this.logger.debug(payload.toString());

      const parsedMessage = JSON.parse(payload.toString());
      if (!MqttEventMQ.isSensorReadEvent(parsedMessage)) return;

      this.processReadEventUC.execute(parsedMessage);
    });
  }

  public static isSensorReadEvent(obj: unknown): obj is SensorReadEvent {
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
    this.logger.info('Subscribing to topic', this.subscribeTopic);
    try {
      await this.client.subscribe(this.subscribeTopic);
    } catch (err) {
      this.logger.error('Cannot subscribe to topic', err);
      throw err;
    }
  }

  async stopListening() {
    this.logger.info('Shutting down');
    await this.client.end();
  }

  onNewEvent(usecase: IProcessReadEventUC): void {
    this.processReadEventUC = usecase;
  }
}
