import { SensorCommand } from '../../core/domain/SensorCommand';

export type ValidationResult = {
  success: boolean;
  errName: string;
  errMsg: string;
};

export function validate(reqBody: unknown): ValidationResult {
  if (reqBody['sensorId'] === undefined || reqBody['details'] === undefined) {
    return {
      success: false,
      errName: 'MissingProperties',
      errMsg: "Body properties must include: 'sensorId' and 'details'",
    };
  }

  if (typeof reqBody['sensorId'] !== 'number' || typeof reqBody['details'] !== 'number') {
    return {
      success: false,
      errName: 'InvalidPropertyType',
      errMsg: 'Body properties should be of correct type',
    };
  }

  return { success: true, errName: '', errMsg: '' };
}

export function parseSensorCommand(reqBody: unknown): SensorCommand {
  return { sensorId: reqBody['sensorId'], details: reqBody['details'] };
}
