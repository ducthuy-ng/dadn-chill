import { Sensor } from '../Sensor';
import { SensorReadEvent } from '../SensorReadEvent';
import { SkipCheck } from './SkipCheck';

describe('Test checkTemperature domain logic', () => {
  const middleware = new SkipCheck();
  const testSensor = new Sensor(1, 'ABC');

  it('skip should not care anything', () => {
    const belowThresholdEvent: SensorReadEvent = {
      sensorId: 1,
      readTimestamp: new Date().toISOString(),
      sensorValue: {
        humidity: 1,
        temperature: 55,
        lightIntensity: 0,
        earthMoisture: 0,
      },
    };

    const receivedNotifications = middleware.check(belowThresholdEvent, testSensor);
    expect(receivedNotifications).toHaveLength(0);
  });
});
