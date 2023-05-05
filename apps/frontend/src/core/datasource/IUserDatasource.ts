import UserDTO from '../services/UserDTO';

export default interface IUserDatasource {
  // return client id, in headers
  login: (credentials: UserDTO) => Promise<string>;
  logout: () => Promise<void>;
}
