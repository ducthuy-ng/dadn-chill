import { Http } from './httpClient';
import { SensorData } from '../domain/Sensor';
import ISensorDatasource from '../datasource/ISensorListDatasource';

export default class SensorAdapter implements ISensorDatasource {
  private http: Http;

  public constructor(http: Http) {
    this.http = http;
  }

  public getAllSensors = async (page: number): Promise<SensorData[]> => {
    const response = await this.http.get<SensorData[]>(`/sensors?page=${page}`);
    return response.data;
  };
  public getSensorById = async (id: string): Promise<SensorData> => {
    const response = await this.http.get<SensorData>(`/sensor/${id}`);
    return response.data;
  };
}
