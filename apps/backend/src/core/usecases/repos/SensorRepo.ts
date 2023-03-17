import { Sensor, SensorId } from '../../domain/Sensor';

export interface SensorRepo {
  saveSensor(sensor: Sensor): Promise<void>;

  /**
   *
   * @throws {SensorIdNotFound}
   */
  getById(id: SensorId): Promise<Sensor | null>;
  /**
   *
   * @throws {PageOutOfRange}
   */
  getByPage(pageNum: number): Promise<Sensor[]>;

  getNextId(): Promise<SensorId>;

  deleteById(id: SensorId): Promise<void>;
}

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
