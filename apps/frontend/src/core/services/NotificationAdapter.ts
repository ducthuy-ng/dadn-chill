import INotiDatasource from '../datasource/INotiDatasource';
import { Notification } from '../domain/Notification';
import { Http } from './httpClient';

export default class NotificationAdapter implements INotiDatasource {
  private http: Http;

  public constructor(http: Http) {
    this.http = http;
  }
  public getAllSensors = async (offset: number, limit: number): Promise<Notification[]> => {
    const response = await this.http.get(`/notifications?offset=${offset}&limit=${limit}`);
    return response.data;
  };
}
