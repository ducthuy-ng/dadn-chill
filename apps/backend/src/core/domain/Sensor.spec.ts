import { Sensor } from './Sensor';

describe('Test Sensor domain logic', () => {
  let testSensor: Sensor;

  beforeEach(() => {
    testSensor = new Sensor(1, 'ABC');
  });

  it('Create simple sensor should success', () => {
    const sensor = new Sensor(1, 'ABC');
    expect(sensor).not.toBeNull();
  });

  it('Sensor should handle event correctly', () => {
    testSensor.processReadEvent({
      sensorId: 1,
      readTimestamp: new Date().toISOString(),
      sensorValue: {
        humidity: 1,
        temperature: 1,
        lightIntensity: 1,
        earthMoisture: 1,
      },
    });

    expect(testSensor.getReadValue()).toStrictEqual({
      humidity: 1,
      temperature: 1,
      lightIntensity: 1,
      earthMoisture: 1,
    });
  });

  it('Unmatched event should be ignored', () => {
    const basedEventTimestamp = new Date().toISOString();
    const basedEvent = {
      sensorId: 1,
      readTimestamp: basedEventTimestamp,
      sensorValue: {
        humidity: 1,
        temperature: 1,
        lightIntensity: 1,
        earthMoisture: 1,
      },
    };

    const unmatchedEvent = {
      sensorId: 2,
      readTimestamp: new Date().toISOString(),
      sensorValue: {
        humidity: 2,
        temperature: 2,
        lightIntensity: 2,
        earthMoisture: 2,
      },
    };

    testSensor.processReadEvent(basedEvent);
    testSensor.processReadEvent(unmatchedEvent);

    expect(testSensor.getReadValue()).toStrictEqual({
      readTimestamp: basedEventTimestamp,
      humidity: 1,
      temperature: 1,
      lightIntensity: 1,
      earthMoisture: 1,
    });
  });
});
