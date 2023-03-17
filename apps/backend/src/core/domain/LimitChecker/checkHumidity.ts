import { LimitCheckMiddleware } from '.';
import { Sensor } from '../Sensor';
import { SensorReadEvent } from '../SensorReadEvent';
import { Notification } from '../Notification';

class CheckHumidityMiddleware extends LimitCheckMiddleware {
  private humidityThreshold: number;
  constructor(humidityThreshold: number) {
    super();
    this.humidityThreshold = humidityThreshold;
  }

  public check(event: SensorReadEvent, processingSensor: Sensor): Notification[] {
    const returnNotifications = [];

    if (event.sensorValue.humidity <= this.humidityThreshold) {
      returnNotifications.push(
        new Notification(processingSensor, 'Alert: too dry', 'The humidity is below threshold')
      );
    }

    return this.checkNext(event, processingSensor).concat(returnNotifications);
  }
}

export { CheckHumidityMiddleware };
