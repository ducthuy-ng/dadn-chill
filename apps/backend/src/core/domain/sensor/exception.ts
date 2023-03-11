import { SensorId } from './sensor';

export class SensorIdNotFound implements Error {
  name: 'SensorIdNotFound';
  message: string;

  constructor(id: SensorId) {
    this.message = `Sensor ID not found: ${id}`;
  }
}

export class PageOutOfRange implements Error {
  name: 'PageOutOfRange';
  message: string;

  constructor(pageNum: number) {
    this.message = `Page number out of range: ${pageNum}`;
  }
}
