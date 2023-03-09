import { SensorReadEvent } from '../sensor/sensorReadEvent';

interface ReadEventRepo {
  storeEvent(event: SensorReadEvent);
}

export { ReadEventRepo };
