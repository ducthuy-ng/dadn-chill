/* eslint-disable @typescript-eslint/no-unused-vars */
import { SensorId } from '../core/domain/Sensor';
import { SensorCommand } from '../core/domain/SensorCommand';
import { SensorController, SensorIdNotConnect } from '../core/usecases/gateways/SensorController';
import { SensorRepo } from '../core/usecases/repos/SensorRepo';

export class DummySensorController implements SensorController {
  private registeredSensor: SensorId[] = [];

  populateSensors(sensorRepo: SensorRepo): Promise<void> {
    return;
  }

  startServer(): Promise<void> {
    return;
  }

  stopServer(): Promise<void> {
    return;
  }

  prepareConnectionForSensor(id: number): void {
    this.registeredSensor.push(id);
  }

  async forwardCommand(command: SensorCommand): Promise<void> {
    if (!this.registeredSensor.includes(command.sensorId)) {
      throw new SensorIdNotConnect(command.sensorId);
    }
  }
}
