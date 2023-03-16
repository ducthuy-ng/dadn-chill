import { LimitCheckMiddleware } from '.';
import { Sensor } from '../Sensor';
import { SensorReadEvent } from '../SensorReadEvent';
import { Notification } from '../Notification';

class CheckTemperatureMiddleware extends LimitCheckMiddleware {
  private temperatureThreshold: number;
  constructor(temperatureThreshold: number) {
    super();
    this.temperatureThreshold = temperatureThreshold;
  }

  public check(event: SensorReadEvent, processingSensor: Sensor): Notification[] {
    const returnNotifications = [];
    if (event.sensorValue.temperature >= this.temperatureThreshold) {
      returnNotifications.push(
        new Notification(
          processingSensor,
          'Alert: too hot',
          'The temperature has passed the threshold'
        )
      );
    }

    return this.checkNext(event, processingSensor).concat(returnNotifications);
  }
}

export { CheckTemperatureMiddleware };
