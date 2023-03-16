import { LimitCheckMiddleware } from '.';
import { CheckHumidityMiddleware } from './checkHumidity';
import { CheckTemperatureMiddleware } from './checkTemperature';
import { Sensor } from '../Sensor';
import { SensorReadEvent } from '../SensorReadEvent';

describe('Test linking middleware', () => {
  const middleware = LimitCheckMiddleware.link(
    new CheckTemperatureMiddleware(42),
    new CheckHumidityMiddleware(5)
  );

  const testSensor = new Sensor(1, 'ABC');

  it('only temperature passed does not affect others', () => {
    const onlyTempErrorEvent: SensorReadEvent = {
      sensorId: 1,
      readTimestamp: new Date().toISOString(),
      sensorValue: {
        humidity: 10,
        temperature: 45,
        lightIntensity: 0,
        earthMoisture: 0,
      },
    };

    const receivedNotifications = middleware.check(onlyTempErrorEvent, testSensor);
    expect(receivedNotifications).toHaveLength(1);
  });

  it('only humidity passed does not affect other', () => {
    const onlyHumidErrorEvent: SensorReadEvent = {
      sensorId: 1,
      readTimestamp: new Date().toISOString(),
      sensorValue: {
        humidity: 2,
        temperature: 0,
        lightIntensity: 0,
        earthMoisture: 0,
      },
    };

    const receivedNotifications = middleware.check(onlyHumidErrorEvent, testSensor);
    expect(receivedNotifications).toHaveLength(1);
  });

  it('all limit passed should returns', () => {
    const bothLimitPassedEvent: SensorReadEvent = {
      sensorId: 1,
      readTimestamp: new Date().toISOString(),
      sensorValue: {
        humidity: 2,
        temperature: 50,
        lightIntensity: 0,
        earthMoisture: 0,
      },
    };

    const receivedNotifications = middleware.check(bothLimitPassedEvent, testSensor);
    expect(receivedNotifications).toHaveLength(2);
  });
});
