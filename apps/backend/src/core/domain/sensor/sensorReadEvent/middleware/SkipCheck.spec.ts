import { SensorReadEvent } from '..';
import { Sensor } from '../..';
import { SkipCheck } from './SkipCheck';

describe('Test checkTemperature domain logic', () => {
  const middleware = new SkipCheck();
  const testSensor = new Sensor(1, 'ABC');

  it('skip should not care anything', () => {
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
    expect(receivedNotifications).toHaveLength(0);
  });
});
