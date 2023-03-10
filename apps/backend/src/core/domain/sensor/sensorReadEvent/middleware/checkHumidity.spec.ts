import { SensorReadEvent } from '..';
import { Sensor } from '../..';
import { CheckHumidityMiddleware } from './checkHumidity';

describe('Test checkHumidity domain logic', () => {
  const middleware = new CheckHumidityMiddleware(5);
  const testSensor = new Sensor(1, 'ABC');

  it('below threshold should return notification', () => {
    const belowThresholdEvent: SensorReadEvent = {
      sensorId: 1,
      sensorValue: {
        readTimestamp: new Date().toISOString(),
        humidity: 1,
        temperature: 0,
        lightIntensity: 0,
        windSpeed: 0,
      },
    };

    const receivedNotifications = middleware.check(belowThresholdEvent, testSensor);
    expect(receivedNotifications).toHaveLength(1);

    const notification = receivedNotifications[0];
    expect(notification.getSensorName()).toEqual(testSensor.getName());
  });

  it('above threshold should not return notification', () => {
    const belowThresholdEvent: SensorReadEvent = {
      sensorId: 1,
      sensorValue: {
        readTimestamp: new Date().toISOString(),
        humidity: 100,
        temperature: 0,
        lightIntensity: 0,
        windSpeed: 0,
      },
    };

    const receivedNotifications = middleware.check(belowThresholdEvent, testSensor);
    expect(receivedNotifications).toHaveLength(0);
  });
});
