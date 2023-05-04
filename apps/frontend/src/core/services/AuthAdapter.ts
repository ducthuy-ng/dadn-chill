import IUserDatasource from '../datasource/IUserDatasource';
import UserDTO from './UserDTO';
import { Http } from './httpClient';

export class AuthAdapter implements IUserDatasource {
  private _http: Http;

  public constructor(http: Http) {
    this._http = http;
  }

  public login = async (credentials: UserDTO): Promise<string> => {
    return await this._http.post<UserDTO, string>('/auth/login', credentials);
  };

  public logout = async (): Promise<void> => {
    await this._http.get<void>('/auth/logout');
  };
}
