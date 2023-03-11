import { Sensor, SensorRepo } from '../domain/sensor/sensor';

export class GetSensorListUseCase {
  private sensorRepo: SensorRepo;

  constructor(sensorRepo: SensorRepo) {
    this.sensorRepo = sensorRepo;
  }

  execute(pageNum: number): Sensor[] {
    return this.sensorRepo.getByPage(pageNum);
  }
}
