import IUserDatasource from '../datasource/IUserDatasource';
import IUsecase from './IUsecase';

export default class Logout implements IUsecase<void> {
  private dataSource: IUserDatasource;

  public constructor(dataSource: IUserDatasource) {
    this.dataSource = dataSource;
  }

  public executeUsecase = async (): Promise<void> => {
    await this.dataSource.logout();
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('email');
  };
}
