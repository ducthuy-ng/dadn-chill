import { SensorData } from '../domain/Sensor';

export default interface ISensorDatasource {
  getAllSensors: (page: number) => Promise<SensorData[]>;
  getSensorById: (id: string) => Promise<SensorData>;
}
