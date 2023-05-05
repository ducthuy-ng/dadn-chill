import INotiDatasource from '../datasource/INotiDatasource';
import { Notification } from '../domain/Notification';
import IUsecase from './IUsecase';

export default class GetNotification implements IUsecase<Notification[]> {
  private datasource: INotiDatasource;
  private offset: number;
  private limit: number;

  public constructor(datasource: INotiDatasource, offset: number, limit: number) {
    this.datasource = datasource;
    this.offset = offset;
    this.limit = limit;
  }

  public executeUsecase = (): Promise<Notification[]> => {
    return this.datasource.getAllSensors(this.offset, this.limit);
  };
}
