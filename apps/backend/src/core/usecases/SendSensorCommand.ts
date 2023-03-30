import { SensorCommand } from '../domain/SensorCommand';
import { SensorController } from './gateways/SensorController';

export class SendSensorCommand {
  controller: SensorController;

  constructor(controller: SensorController) {
    this.controller = controller;
  }

  private execute(command: SensorCommand) {
    this.controller.forwardCommand(command);
  }
}
