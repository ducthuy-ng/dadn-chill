import { SensorReadEvent } from './SensorReadEvent';
import { SensorValue } from './SensorValue';

interface GeoLocation {
  longitude: number;
  latitude: number;
}

type SensorId = number;

class Sensor {
  public static OnlineInterval = 5;

  private id: SensorId;
  private name: string;

  private setupLocation: GeoLocation = { longitude: 0, latitude: 0 };

  private lastReadTimestamp = '1970-01-01T00:00:00';
  private readValue: SensorValue = {
    temperature: 0,
    humidity: 0,
    lightIntensity: 0,
    earthMoisture: 0,
  };

  constructor(newId: number, name: string) {
    this.id = newId;
    this.setName(name);
  }

  public static reconstruct(
    id: number,
    name: string,
    setupLocation: GeoLocation,
    lastReadTimestamp: string,
    temperature: number,
    humidity: number,
    lightIntensity: number,
    earthMoisture: number
  ): Sensor {
    const sensor = new Sensor(id, name);
    sensor.setupLocation = setupLocation;
    sensor.lastReadTimestamp = lastReadTimestamp;

    sensor.readValue = {
      temperature: temperature,
      humidity: humidity,
      lightIntensity: lightIntensity,
      earthMoisture: earthMoisture,
    };

    return sensor;
  }

  public processReadEvent(event: SensorReadEvent) {
    if (event.sensorId !== this.id) return;

    this.readValue = event.sensorValue;
  }

  public getReadValue(): SensorValue {
    return this.readValue;
  }

  private setName(newName: string) {
    this.name = newName;
  }

  public moveSensorToNewLocation(location: GeoLocation) {
    this.setupLocation = location;
  }

  public getId(): number {
    return this.id;
  }

  public getName(): string {
    return this.name;
  }

  public getSetupLocation(): GeoLocation {
    return this.setupLocation;
  }

  public getLastReadTimestamp(): string {
    return this.lastReadTimestamp;
  }
}

export { GeoLocation, Sensor, SensorId };
