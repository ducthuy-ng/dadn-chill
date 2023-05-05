import { SensorData } from '../domain/Sensor';
import StreamDTO from '../services/StreamDTO';

export default interface ISensorStream {
  subscribe: (sensorIds: number[]) => Promise<string>;
  changeSubscription: (streamDTO: StreamDTO) => Promise<SensorData>;
}
