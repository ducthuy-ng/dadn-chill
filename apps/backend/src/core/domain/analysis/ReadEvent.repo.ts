import { SensorReadEvent } from '../sensor/sensorReadEvent';

export interface ReadEventRepo {
  storeEvent(event: SensorReadEvent);
}
