import { Sensor } from './sensor';

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
    const readTimestamp = new Date().toISOString()
    testSensor.processReadEvent({
      sensorId: 1,
      sensorValue: {
        readTimestamp: readTimestamp,
        humidity: 1,
        temperature: 1,
        lightIntensity: 1,
        windSpeed: 1,
      },
    });

    expect(testSensor.getReadValue()).toStrictEqual({
      readTimestamp: readTimestamp,
      humidity: 1,
      temperature: 1,
      lightIntensity: 1,
      windSpeed: 1,
    });
  });

  it('Unmatched event should be ignored', () => {
    const basedEventTimestamp = new Date().toISOString();
    const basedEvent = {
      sensorId: 1,
      sensorValue: {
        readTimestamp: basedEventTimestamp,
        humidity: 1,
        temperature: 1,
        lightIntensity: 1,
        windSpeed: 1,
      },
    };

    const unmatchedEvent = {
      sensorId: 2,
      sensorValue: {
        readTimestamp: new Date().toISOString(),
        humidity: 2,
        temperature: 2,
        lightIntensity: 2,
        windSpeed: 2,
      },
    };

    testSensor.processReadEvent(basedEvent);
    testSensor.processReadEvent(unmatchedEvent);

    expect(testSensor.getReadValue()).toStrictEqual({
      readTimestamp: basedEventTimestamp,
      humidity: 1,
      temperature: 1,
      lightIntensity: 1,
      windSpeed: 1,
    });

    // expect(testSensor.getHumidity()).toEqual(1);
    // expect(testSensor.getTemperature()).toEqual(1);
    // expect(testSensor.getLightIntensity()).toEqual(1);
    // expect(testSensor.getWindSpeed()).toEqual(1);
  });
});
