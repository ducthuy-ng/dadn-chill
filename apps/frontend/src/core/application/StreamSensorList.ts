import ISensorStream from '../datasource/ISensorStream';
import IUsecase from './IUsecase';

export default class GetClientId implements IUsecase<string> {
  private dataSource: ISensorStream;
  private sensorIds: number[];

  public constructor(dataSource: ISensorStream, sensorIds: number[]) {
    this.dataSource = dataSource;
    this.sensorIds = sensorIds;
  }

  public executeUsecase = async (): Promise<string> => {
    return this.dataSource.subscribe(this.sensorIds);
  };
}
