import { SensorReadEvent } from '..';
import { Sensor } from '../..';
import { CheckTemperatureMiddleware } from './checkTemperature';

describe('Test checkTemperature domain logic', () => {
  const middleware = new CheckTemperatureMiddleware(42);
  const testSensor = new Sensor(1, 'ABC');

  it('above threshold should return notification', () => {
    const belowThresholdEvent: SensorReadEvent = {
      sensorId: 1,
      sensorValue: {
        readTimestamp: new Date().toISOString(),
        humidity: 1,
        temperature: 55,
        lightIntensity: 0,
        windSpeed: 0,
      },
    };

    const receivedNotifications = middleware.check(belowThresholdEvent, testSensor);
    expect(receivedNotifications).toHaveLength(1);

    const notification = receivedNotifications[0];
    expect(notification.getSensorName()).toEqual(testSensor.getName());
  });

  it('below threshold should not return notification', () => {
    const belowThresholdEvent: SensorReadEvent = {
      sensorId: 1,
      sensorValue: {
        readTimestamp: new Date().toISOString(),
        humidity: 100,
        temperature: 19,
        lightIntensity: 0,
        windSpeed: 0,
      },
    };

    const receivedNotifications = middleware.check(belowThresholdEvent, testSensor);
    expect(receivedNotifications).toHaveLength(0);
  });
});
