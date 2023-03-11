import { Sensor, SensorId, SensorRepo } from '../domain/sensor/sensor';

export class GetSingleSensorUseCase {
  private sensorRepo: SensorRepo;

  constructor(sensorRepo: SensorRepo) {
    this.sensorRepo = sensorRepo;
  }

  execute(sensorId: SensorId): Sensor {
    return this.sensorRepo.getById(sensorId);
  }
}
