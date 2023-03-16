import { Sensor } from '../domain/Sensor';
import { SensorRepo } from './repos/SensorRepo';

export class GetSensorListUseCase {
  private sensorRepo: SensorRepo;

  constructor(sensorRepo: SensorRepo) {
    this.sensorRepo = sensorRepo;
  }

  async execute(pageNum: number): Promise<Sensor[]> {
    return await this.sensorRepo.getByPage(pageNum);
  }
}
