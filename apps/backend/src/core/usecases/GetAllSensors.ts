import { Sensor } from '../domain/Sensor';
import { SensorRepo } from './repos/SensorRepo';

export class GetAllSensorUseCase {
  private sensorRepo: SensorRepo;

  constructor(sensorRepo: SensorRepo) {
    this.sensorRepo = sensorRepo;
  }

  async execute(offset: number, limit: number): Promise<[Sensor[], number]> {
    const numOfSensor = await this.sensorRepo.getNumOfSensors();

    if (limit < 0) return [[], numOfSensor];
    if (offset >= numOfSensor) return [[], numOfSensor];

    if (offset < 0) offset = 0;
    if (offset + limit > numOfSensor) limit = numOfSensor - offset;

    const sensorList = await this.sensorRepo.getAllSensors(offset, limit);
    return [sensorList, numOfSensor];
  }
}
