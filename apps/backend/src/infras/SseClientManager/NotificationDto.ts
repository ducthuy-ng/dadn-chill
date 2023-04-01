import { SensorId } from '../../core/domain/Sensor';

export type NotificationDto = {
  id: string;
  idOfOriginSensor: SensorId;
  nameOfOriginSensor: string;

  createTimestamp: string;

  header: string;
  content: string;
};
