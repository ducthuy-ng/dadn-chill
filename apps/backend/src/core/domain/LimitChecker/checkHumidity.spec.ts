import { Sensor } from '../Sensor';
import { SensorReadEvent } from '../SensorReadEvent';
import { CheckHumidityMiddleware } from './checkHumidity';

describe('Test checkHumidity domain logic', () => {
  const middleware = new CheckHumidityMiddleware(5);
  const testSensor = new Sensor(1, 'ABC');

  it('below threshold should return notification', () => {
    const belowThresholdEvent: SensorReadEvent = {
      sensorId: 1,
      readTimestamp: new Date().toISOString(),
      sensorValue: {
        humidity: 1,
        temperature: 0,
        lightIntensity: 0,
        earthMoisture: 0,
      },
    };

    const receivedNotifications = middleware.check(belowThresholdEvent, testSensor);
    expect(receivedNotifications).toHaveLength(1);

    const notification = receivedNotifications[0];
    expect(notification.nameOfOriginSensor).toEqual(testSensor.getName());
  });

  it('above threshold should not return notification', () => {
    const belowThresholdEvent: SensorReadEvent = {
      sensorId: 1,
      readTimestamp: new Date().toISOString(),
      sensorValue: {
        humidity: 100,
        temperature: 0,
        lightIntensity: 0,
        earthMoisture: 0,
      },
    };

    const receivedNotifications = middleware.check(belowThresholdEvent, testSensor);
    expect(receivedNotifications).toHaveLength(0);
  });
});
