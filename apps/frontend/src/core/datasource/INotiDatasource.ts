import { Notification } from '../domain/Notification';

export default interface INotiDatasource {
  getAllSensors: (offset: number, limit: number) => Promise<Notification[]>;
}
