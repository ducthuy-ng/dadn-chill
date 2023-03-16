import { LimitCheckMiddleware } from '.';
import { Notification } from '../Notification';
import { Sensor } from '../Sensor';
import { SensorReadEvent } from '../SensorReadEvent';

export class SkipCheck extends LimitCheckMiddleware {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public check(event: SensorReadEvent, processingSensor: Sensor): Notification[] {
    return [];
  }
}
