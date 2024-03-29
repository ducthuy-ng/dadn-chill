import * as mqtt from 'async-mqtt';
import { SensorId } from '../../core/domain/Sensor';
import { SensorCommand } from '../../core/domain/SensorCommand';
import {
  SensorController,
  SensorIdNotConnect,
  TransmissionError,
} from '../../core/usecases/gateways/SensorController';
import { Logger } from '../../core/usecases/Logger';
import { SensorRepo } from '../../core/usecases/repos/SensorRepo';

type TopicName = string;

export class MqttSensorController implements SensorController {
  private mqttTopicPrefix = 'controller/sensor';

  private mqttEndPoint: string;
  private client: mqtt.AsyncMqttClient;
  private sensorTopicMap = new Map<SensorId, TopicName>();

  private logger: Logger;

  constructor(mqttEndPoint: string, logger: Logger) {
    this.logger = logger;

    this.mqttEndPoint = mqttEndPoint;
  }

  async populateSensors(sensorRepo: SensorRepo): Promise<void> {
    for (const sensorId of await sensorRepo.getAllSensorIds()) {
      this.sensorTopicMap.set(sensorId, `${this.mqttTopicPrefix}-${sensorId}`);
    }

    this.logger.info('populate sensors successfully');
  }

  async startServer(): Promise<void> {
    this.logger.info('starting connection');
    this.client = await mqtt.connectAsync(this.mqttEndPoint);
    this.logger.info('connected to MQTT at server', this.mqttEndPoint);
  }

  async stopServer(): Promise<void> {
    this.logger.info('stop connection');
    this.client.end();
  }

  prepareConnectionForSensor(id: number): void {
    this.logger.info('preparing connection for sensor', id);
    this.sensorTopicMap.set(id, `${this.mqttTopicPrefix}-${id}`);
  }

  async forwardCommand(command: SensorCommand): Promise<void> {
    this.logger.debug('sending command to sensor', command.sensorId);

    const receivedSensorId = command.sensorId;
    const receivedTopic = this.sensorTopicMap.get(receivedSensorId);

    if (receivedTopic === undefined) throw new SensorIdNotConnect(receivedSensorId);

    try {
      await this.client.publish(receivedTopic, String(command.details));
      this.logger.info('send message to topic', receivedTopic);
    } catch (err) {
      this.logger.error('failed to send command, details:', receivedSensorId, err);

      if (err instanceof Error) throw new TransmissionError(err.message);
      throw new TransmissionError('unknown error, visit the log');
    }
  }
}
