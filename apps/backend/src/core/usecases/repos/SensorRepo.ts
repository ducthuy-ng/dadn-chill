import { Sensor, SensorId } from '../../domain/Sensor';

export interface SensorRepo {
  saveSensor(sensor: Sensor): Promise<void>;

  /**
   *
   * @throws {SensorIdNotFound}
   */
  getById(id: SensorId): Promise<Sensor | null>;

  getAllSensorIds(): Promise<SensorId[]>;

  /**
   *
   * @throws {PageOutOfRange}
   */
  getAllSensors(offset: number, limit: number): Promise<Sensor[]>;
  getNumOfSensors(): Promise<number>;

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
