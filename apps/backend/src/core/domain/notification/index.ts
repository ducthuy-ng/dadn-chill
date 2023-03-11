import { randomUUID } from 'crypto';
import { Sensor } from '../sensor';

class Notification {
  private id: string;
  private fromSensorId: number;

  // Redundancy for performance
  private sensorName: string;

  private createdDate: Date;

  private header: string;
  private content: string;

  constructor(generatedSensor: Sensor, header: string, content: string) {
    this.id = randomUUID();
    this.setFromSensorId(generatedSensor.getId());
    this.setSensorName(generatedSensor.getName());

    this.createdDate = new Date();

    this.setHeader(header);
    this.setContent(content);
  }

  setFromSensorId(fromSensorId: number) {
    this.fromSensorId = fromSensorId;
  }

  setSensorName(sensorName: string) {
    this.sensorName = sensorName;
  }

  setHeader(header: string) {
    this.header = header;
  }

  setContent(content: string) {
    this.content = content;
  }

  getSensorName(): string {
    return this.sensorName;
  }

  getHeader(): string {
    return this.header;
  }

  getContent(): string {
    return this.content;
  }

  getCreatedTimestamp(): string {
    return this.createdDate.toISOString();
  }
}

interface NotificationRepo {
  add(...notifications: Notification[]): void;

  /**
   *
   * @throws {PageOutOfRange}
   */
  getLastestNotification(pageNum: number): Notification[];
}

export { Notification, NotificationRepo };
