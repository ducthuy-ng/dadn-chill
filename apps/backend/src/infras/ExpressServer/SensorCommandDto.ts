import { SensorCommand } from '../../core/domain/SensorCommand';
import { InvalidPropertyType, MissingProperties } from './exceptions';

/**
 *
 * @throws MissingProperties InvalidPropertyType
 * @returns
 */
export function validate(reqBody: unknown): void {
  if (reqBody['sensorId'] === undefined || reqBody['details'] === undefined) {
    throw new MissingProperties("Body properties must include: 'sensorId' and 'details'");
  }

  if (typeof reqBody['sensorId'] !== 'number' || typeof reqBody['details'] !== 'number') {
    throw new InvalidPropertyType('Body properties should be of correct type');
  }
}

export function parseSensorCommand(reqBody: unknown): SensorCommand {
  return { sensorId: reqBody['sensorId'], details: reqBody['details'] };
}
