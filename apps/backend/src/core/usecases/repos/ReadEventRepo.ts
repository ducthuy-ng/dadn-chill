import { SensorReadEvent } from '../../domain/SensorReadEvent';

export class FailedToStoreEvent implements Error {
  name: 'FailedToStoreEvent';
  message: string;

  constructor(msg: string) {
    this.message = msg;
  }
}

export interface ReadEventRepo {
  storeEvent(event: SensorReadEvent): Promise<void>;
}
