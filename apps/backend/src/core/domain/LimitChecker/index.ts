import { Sensor } from '../Sensor';
import { SensorReadEvent } from '../SensorReadEvent';
import { Notification } from '../Notification';

abstract class LimitCheckMiddleware {
  private next: LimitCheckMiddleware = null;

  public static link(
    first: LimitCheckMiddleware,
    ...chain: LimitCheckMiddleware[]
  ): LimitCheckMiddleware {
    let head = first;
    for (const middleware of chain) {
      head.next = middleware;
      head = head.next;
    }

    return first;
  }

  public abstract check(event: SensorReadEvent, processingSensor: Sensor): Notification[];

  protected checkNext(event: SensorReadEvent, processingSensor: Sensor): Notification[] {
    if (this.next == null) {
      return [];
    }
    return this.next.check(event, processingSensor);
  }
}

export { LimitCheckMiddleware };
