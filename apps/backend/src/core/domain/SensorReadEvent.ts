import { SensorId } from './Sensor';
import { SensorValue } from './SensorValue';

export interface SensorReadEvent {
  sensorId: SensorId;
  readTimestamp: string;
  sensorValue: SensorValue;
}
