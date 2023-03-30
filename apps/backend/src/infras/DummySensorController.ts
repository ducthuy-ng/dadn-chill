/* eslint-disable @typescript-eslint/no-unused-vars */
import { SensorId } from '../core/domain/Sensor';
import { SensorCommand } from '../core/domain/SensorCommand';
import { OperationResult, SensorController } from '../core/usecases/gateways/SensorController';
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

  async forwardCommand(command: SensorCommand): Promise<OperationResult> {
    if (this.registeredSensor.includes(command.sensorId)) {
      return { success: true, detail: `command sent: ${command.sensorId} - ${command.details}` };
    }

    return { success: false, detail: `command sent: ${command.sensorId} - ${command.details}` };
  }
}
