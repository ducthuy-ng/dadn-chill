import { SensorId } from '../../domain/Sensor';
import { SensorCommand } from '../../domain/SensorCommand';
import { SensorRepo } from '../repos/SensorRepo';

export type OperationResult = {
  success: boolean;
  detail: string;
};

export interface SensorController {
  populateSensors(sensorRepo: SensorRepo): Promise<void>;

  startServer(): Promise<void>;
  stopServer(): Promise<void>;

  prepareConnectionForSensor(id: SensorId): void;
  forwardCommand(command: SensorCommand): Promise<OperationResult>;
}
