import { SensorId } from '../../domain/Sensor';
import { SensorCommand } from '../../domain/SensorCommand';
import { SensorRepo } from '../repos/SensorRepo';

export class SensorIdNotConnect implements Error {
  name: 'SensorIdNotConnect';
  message: string;

  constructor(id: SensorId) {
    this.message = `Sensor ID not connected to SensorController: ${id}`;
  }
}

export class TransmissionError implements Error {
  name: 'TransmissionError';
  message: string;

  constructor(details: unknown) {
    this.message = String(details);
  }
}

export interface SensorController {
  populateSensors(sensorRepo: SensorRepo): Promise<void>;

  startServer(): Promise<void>;
  stopServer(): Promise<void>;

  prepareConnectionForSensor(id: SensorId): void;

  /**
   *
   * @throws SensorIdNotConnect
   */
  forwardCommand(command: SensorCommand): Promise<void>;
}
