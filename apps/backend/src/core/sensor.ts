import { SensorReadEvent } from './sensorReadEvent';

export interface GeoLocation {
  longtitude: number;
  latitude: number;
}

export class Sensor {
  private id: number;

  private setupLocation: GeoLocation;

  private lastReadTime: Date = null;
  private humidity = 0;
  private temperature = 0;

  constructor(newId: number) {
    this.id = newId;
  }

  public processReadEvent(event: SensorReadEvent) {
    this.lastReadTime = new Date(event.queueReceivedTimestamp);
    this.updateHumidity(event.humidity);
    this.updateTemperature(event.temperature);
  }

  private updateHumidity(newHumidity: number) {
    this.humidity = newHumidity;
  }

  private updateTemperature(newTemperature: number) {
    this.temperature = newTemperature;
  }

  public getId(): number {
    return this.id;
  }

  public getHumidity(): number {
    return this.humidity;
  }

  public getTemperature(): number {
    return this.temperature;
  }

  public getLastReadTime(): Date {
    return this.lastReadTime;
  }

  public getSetupLocation(): GeoLocation {
    return this.setupLocation;
  }
}
