import { LimitCheckMiddleware } from '.';
import { SensorReadEvent } from '..';
import { Notification } from '../../../notification';
import { Sensor } from '../../sensor';

export class SkipCheck extends LimitCheckMiddleware {
  public check(
    event: SensorReadEvent,
    processingSensor: Sensor
  ): Notification[] {
    return [];
  }
}
