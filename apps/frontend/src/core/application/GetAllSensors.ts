import ISensorListDatasource from '../datasource/ISensorListDatasource';
import { SensorData } from '../domain/Sensor';
import IUsecase from './IUsecase';

export default class GetAllSensors implements IUsecase<SensorData[]> {
  private datasource: ISensorListDatasource;
  private page: number;

  public constructor(datasource: ISensorListDatasource, page = 1) {
    this.datasource = datasource;
    this.page = page;
  }

  public executeUsecase = (): Promise<SensorData[]> => {
    return this.datasource.getAllSensors(this.page);
  };
}
