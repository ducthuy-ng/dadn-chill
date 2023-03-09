import { LimitCheckMiddleware } from '.';
import { SensorReadEvent } from '..';
import { Notification } from '../../../notification';
import { Sensor } from '../..';

class CheckHumidityMiddleware extends LimitCheckMiddleware {
  private humidityThreshold: number;
  constructor(humidityThreshold: number) {
    super();
    this.humidityThreshold = humidityThreshold;
  }

  public check(
    event: SensorReadEvent,
    processingSensor: Sensor
  ): Notification[] {
    const returnNotifications = [];

    if (event.sensorValue.humidity <= this.humidityThreshold) {
      returnNotifications.push(
        new Notification(
          processingSensor,
          'Alert: too dry',
          'The humidity is below threshold'
        )
      );
    }

    return this.checkNext(event, processingSensor).concat(returnNotifications);
  }
}

export { CheckHumidityMiddleware };
