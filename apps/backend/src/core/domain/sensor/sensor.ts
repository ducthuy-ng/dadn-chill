import { SensorReadEvent } from './sensorReadEvent';
import { SensorValue } from './sensorValue';

interface GeoLocation {
  longitude: number;
  latitude: number;
}

type SensorId = number;

class Sensor {
  public static OnlineInterval = 5;

  private id: SensorId;
  private name: string;

  private setupLocation: GeoLocation;

  private readValue: SensorValue;

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
    windSpeed: number
  ): Sensor {
    const sensor = new Sensor(id, name);
    sensor.setupLocation = setupLocation;

    sensor.readValue = {
      readTimestamp: lastReadTimestamp,
      temperature: temperature,
      humidity: humidity,
      lightIntensity: lightIntensity,
      windSpeed: windSpeed,
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
}

interface SensorRepo {
  saveSensor(sensor: Sensor);

  /**
   *
   * @throws {SensorIdNotFound}
   */
  getById(id: number): Sensor;
  /**
   *
   * @throws {PageOutOfRange}
   */
  getByPage(pageNum: number): Sensor[];

  getNextId(): SensorId;
}

export { GeoLocation, Sensor, SensorId, SensorRepo };
