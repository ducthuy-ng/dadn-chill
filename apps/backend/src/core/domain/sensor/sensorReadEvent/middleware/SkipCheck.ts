import { LimitCheckMiddleware } from '.';
import { SensorReadEvent } from '..';
import { Notification } from '../../../notification';
import { Sensor } from '../../sensor';

export class SkipCheck extends LimitCheckMiddleware {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public check(event: SensorReadEvent, processingSensor: Sensor): Notification[] {
    return [];
  }
}
