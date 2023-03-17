import { SensorId, Sensor } from '../domain/Sensor';
import { SensorRepo } from './repos/SensorRepo';

export class GetSingleSensorUseCase {
  private sensorRepo: SensorRepo;

  constructor(sensorRepo: SensorRepo) {
    this.sensorRepo = sensorRepo;
  }

  async execute(sensorId: SensorId): Promise<Sensor | null> {
    return this.sensorRepo.getById(sensorId);
  }
}
