import { randomUUID } from 'crypto';
import { Sensor } from './Sensor';

export class HeaderIsTooLong implements Error {
  name = 'HeaderIsTooLong';
  message = 'Header should not be longer than 100 characters';
}

export class Notification {
  readonly id: string;
  readonly idOfOriginSensor: number;

  // Redundancy for performance
  readonly nameOfOriginSensor: string;

  readonly createdDate: Date;

  _header: string;
  _content: string;

  constructor(
    id: string,
    originSensorId: number,
    originSensorName: string,
    createdDate: Date,
    header: string,
    content: string
  ) {
    this.id = id;
    this.idOfOriginSensor = originSensorId;
    this.nameOfOriginSensor = originSensorName;

    this.createdDate = createdDate;

    this._header = header;
    this._content = content;
  }

  public static generate(originSensor: Sensor, header: string, content: string) {
    return new Notification(
      randomUUID(),
      originSensor.getId(),
      originSensor.getName(),
      new Date(),
      header,
      content
    );
  }

  /**
   * @throws HeaderIsTooLong
   */
  set header(newHeader: string) {
    if (newHeader.length > 100) throw new HeaderIsTooLong();

    this._header = newHeader;
  }

  get header(): string {
    return this._header;
  }

  get content(): string {
    return this._content;
  }

  set content(newContent: string) {
    this._content = newContent;
  }

  public getCreatedTimestamp() {
    return this.createdDate.toISOString();
  }
}
