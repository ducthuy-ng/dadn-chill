import User from '../domain/User';
import UserDTO from '../services/UserDTO';
import IUsecase from './IUsecase';
import IUserDatasource from '../datasource/IUserDatasource';

export default class Login implements IUsecase<User> {
  private dataSource: IUserDatasource;
  private userDTO: UserDTO;

  public constructor(dataSource: IUserDatasource, userDTO: UserDTO) {
    this.dataSource = dataSource;
    this.userDTO = userDTO;
  }

  public executeUsecase = async (): Promise<User> => {
    const id = await this.dataSource.login(this.userDTO);

    return {
      id: id,
      email: this.userDTO.email,
      name: '',
    } as User;
  };
}
