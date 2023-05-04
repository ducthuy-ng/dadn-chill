import User from '../domain/User';
import UserDTO from '../services/UserDTO';
import IUsecase from './IUsecase';
import IUserDatasource from '../datasource/IUserDatasource';

export default class Login implements IUsecase<User> {
  private _dataSource: IUserDatasource;
  private _userDTO: UserDTO;

  public constructor(dataSource: IUserDatasource, userDTO: UserDTO) {
    this._dataSource = dataSource;
    this._userDTO = userDTO;
  }

  public executeUsecase = async (): Promise<User> => {
    const id = await this._dataSource.login(this._userDTO);

    return {
      id: id,
      email: this._userDTO.email,
      name: '',
    } as User;
  };
}
