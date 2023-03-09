import {
  PageOutOfRange,
  SensorIdNotFound,
} from '../core/domain/sensor/exception';
import { Sensor, SensorId, SensorRepo } from '../core/domain/sensor/sensor';

export class InMemSensorRepo implements SensorRepo {
  private sensorMap = new Map<SensorId, Sensor>();
  private pageSize = 10;

  saveSensor(sensor: Sensor) {
    this.sensorMap.set(sensor.getId(), sensor);
  }

  getById(id: SensorId): Sensor {
    const sensor = this.sensorMap.get(id);
    if (sensor === undefined) throw new SensorIdNotFound(id);

    return sensor;
  }

  getByPage(pageNum: number): Sensor[] {
    if (pageNum * this.pageSize > this.sensorMap.size) {
      throw new PageOutOfRange(pageNum);
    }

    const sensorArray = Array.from(this.sensorMap.values());
    const sensorSliceToPageSize = sensorArray.slice(
      pageNum * this.pageSize,
      pageNum * (this.pageSize + 1)
    );

    return sensorSliceToPageSize;
  }

  getNextId(): number {
    throw new Error('Method not implemented.');
  }
}
