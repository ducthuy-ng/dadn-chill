import IUserDatasource from '../datasource/IUserDatasource';
import UserDTO from './UserDTO';
import { Http } from './httpClient';

export default class AuthAdapter implements IUserDatasource {
  private http: Http;

  public constructor(http: Http) {
    this.http = http;
  }

  public login = async (credentials: UserDTO): Promise<string> => {
    const result = await this.http.post<UserDTO>('/auth/login', credentials);

    if (result.status !== 200) return '';
    return result.headers['x-api-key'];
  };

  public logout = async (): Promise<void> => {
    await this.http.get<void>('/auth/logout');
  };
}
