import { SensorId } from '../sensor';
import { SensorValue } from '../sensorValue';
import { EventMQ } from './eventMQ';

interface SensorReadEvent {
  sensorId: SensorId;
  sensorValue: SensorValue;
}

export { EventMQ, SensorReadEvent };
