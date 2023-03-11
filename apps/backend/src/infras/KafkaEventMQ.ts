import { EventMQ } from '../core/domain/sensor/sensorReadEvent';

class KafkaEventMQ implements EventMQ {
  onNewEvent(): void {
    throw new Error('Method not implemented.');
  }
}

export { KafkaEventMQ };
