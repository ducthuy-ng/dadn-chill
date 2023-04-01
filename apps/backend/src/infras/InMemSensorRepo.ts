import { Sensor, SensorId } from '../core/domain/Sensor';
import { SensorIdNotFound, SensorRepo } from '../core/usecases/repos/SensorRepo';

export class InMemSensorRepo implements SensorRepo {
  private sensorMap = new Map<SensorId, Sensor>();

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

  async getAllSensors(offset: number, limit: number): Promise<Sensor[]> {
    const sensorArray = Array.from(this.sensorMap.values());
    return sensorArray.slice(offset, offset + limit);
  }

  async getNumOfSensors(): Promise<number> {
    return this.sensorMap.size;
  }

  async getNextId(): Promise<number> {
    return 1;
  }

  async deleteById(id: number): Promise<void> {
    this.sensorMap.delete(id);
  }

  clean() {
    this.sensorMap.clear()
  }
}
