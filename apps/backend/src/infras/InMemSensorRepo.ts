import { SensorId, Sensor } from '../core/domain/Sensor';
import { PageOutOfRange, SensorIdNotFound, SensorRepo } from '../core/usecases/repos/SensorRepo';

export class InMemSensorRepo implements SensorRepo {
  private sensorMap = new Map<SensorId, Sensor>();
  private pageSize = 10;

  async saveSensor(sensor: Sensor): Promise<void> {
    this.sensorMap.set(sensor.getId(), sensor);
  }

  async getById(id: number): Promise<Sensor> {
    const sensor = this.sensorMap.get(id);
    if (sensor === undefined) throw new SensorIdNotFound(id);

    return sensor;
  }

  async getAllSensorIds(): Promise<number[]> {
    return Array.from(this.sensorMap.keys());
  }

  async getByPage(pageNum: number): Promise<Sensor[]> {
    if ((pageNum - 1) * this.pageSize > this.sensorMap.size) {
      throw new PageOutOfRange(pageNum);
    }

    const sensorArray = Array.from(this.sensorMap.values());
    const sensorSliceToPageSize = sensorArray.slice(
      (pageNum - 1) * this.pageSize,
      pageNum * this.pageSize
    );

    return sensorSliceToPageSize;
  }

  async getNextId(): Promise<number> {
    return 1;
  }

  async deleteById(id: number): Promise<void> {
    this.sensorMap.delete(id);
  }
}
