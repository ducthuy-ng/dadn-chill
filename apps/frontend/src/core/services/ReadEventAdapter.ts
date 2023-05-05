import ISensorStream from '../datasource/ISensorStream';
import { SensorData } from '../domain/Sensor';
import StreamDTO from './StreamDTO';
import { Http } from './httpClient';

export default class ReadEventAdapter implements ISensorStream {
  private http: Http;
  private readonly endpoint = '/streaming';

  public constructor(http: Http) {
    this.http = http;
  }

  public subscribe = async (sensorIds: number[]): Promise<string> => {
    const query = sensorIds.reduce(
      (pre, cur, idx) => pre + `${idx !== 0 ? '&' : ''}sensorIds=${cur}`,
      '?'
    );
    const response = await this.http.get(`${this.endpoint}/subscribe${query}`);
    return response.data;
  };

  public changeSubscription = async (streamDTO: StreamDTO): Promise<SensorData> => {
    return (await this.http.get(`${this.endpoint}/changeSubscription`, { params: streamDTO })).data;
  };
}
