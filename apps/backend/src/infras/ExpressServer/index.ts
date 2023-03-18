import { randomUUID } from 'crypto';
import express, { Application, RequestHandler, Response } from 'express';
import { Server } from 'http';
import { Notification } from '../../core/domain/Notification';
import { SensorId } from '../../core/domain/Sensor';
import { SensorReadEvent } from '../../core/domain/SensorReadEvent';
import { GetSensorListUseCase, GetSingleSensorUseCase } from '../../core/usecases';
import {
  ClientId,
  ClientIdNotFound,
  ClientManager,
} from '../../core/usecases/gateways/ClientManager';
import { PageOutOfRange } from '../../core/usecases/repos/SensorRepo';

import { ErrorMsg } from './ErrorMsg';
import { GenerateDto, SensorDto } from './SensorDto';

type Connection = {
  subscribedSensorIdx: SensorId[];
  resp: Response;
};

export class ExpressServer implements ClientManager {
  private app: Application;
  private server: Server;
  private listeningPort: number;

  private clientConnectionMap: Map<ClientId, Connection>;

  private getSingleSensorUC: GetSingleSensorUseCase;
  private getSensorListUC: GetSensorListUseCase;

  constructor(
    listeningPort = 3333,
    getSingleSensorUC: GetSingleSensorUseCase,
    getSensorListUC: GetSensorListUseCase
  ) {
    this.app = express();
    this.setupRestRouter();
    // this.setupClientManagerRoute();

    this.clientConnectionMap = new Map();

    this.listeningPort = listeningPort;

    this.getSingleSensorUC = getSingleSensorUC;
    this.getSensorListUC = getSensorListUC;
  }

  private setupRestRouter() {
    const router = express.Router();
    router.get<null, SensorDto[] | ErrorMsg>('/sensors', this.handleGetSensorList);
    // TODO: router.get<null, SensorDto[] | ErrorMsg>('/sensor/:id', this.handleGetSensorList);

    this.app.use('/', router);
  }

  private handleGetSensorList: RequestHandler<null, SensorDto[] | ErrorMsg> = async (req, res) => {
    const pageNum = parseInt(req.query.pageNum.toString());

    if (isNaN(pageNum) || pageNum <= 0) {
      res.status(400).json({
        name: 'InvalidPageNum',
        detail: 'pageNum should be a valid number',
      });
      return;
    }

    try {
      const sensors = await this.getSensorListUC.execute(pageNum);
      const sensorDtoList = sensors.map((sensor) => GenerateDto(sensor));

      res.json(sensorDtoList);
    } catch (err) {
      if (err instanceof PageOutOfRange)
        res.status(400).json({
          name: 'InvalidPageNum',
          detail: 'pageNum out of range',
        });
    }
  };

  private setupClientManagerRoute() {
    const router = express.Router();
    router.get<{ clientIdx: ClientId }>('/client/:clientIdx', (req, res) => {
      const clientIdx = req.params.clientIdx;

      if (!this.clientConnectionMap.has(clientIdx)) {
        res.send('Route not exist');
        return;
      }

      res.set({
        'Cache-Control': 'no-cache',
        'Content-Type': 'text/event-stream',
        'Access-Control-Allow-Origin': '*',
        Connection: 'keep-alive',
      });
      res.flushHeaders();

      const connection = this.clientConnectionMap.get(clientIdx);
      connection.resp = res;
      console.log(this.clientConnectionMap);

      res.on('close', () => {
        res.end();
        this.clientConnectionMap.delete(clientIdx);
      });
    });

    this.app.use('/streaming', router);
  }

  startListening() {
    this.server = this.app.listen(this.listeningPort);
  }

  stopListening() {
    this.server.close();
  }

  generateNewClientId(): ClientId {
    return randomUUID();
  }

  openConnectionToClient(id: ClientId): void {
    this.clientConnectionMap.set(id, {
      subscribedSensorIdx: [],
      resp: null,
    });
    console.log(this.clientConnectionMap);
  }

  changeClientSubscription(clientId: ClientId, sensorIdx: SensorId[]): void {
    const connection = this.clientConnectionMap.get(clientId);
    if (connection === undefined) {
      throw new ClientIdNotFound(clientId);
    }

    connection.subscribedSensorIdx = sensorIdx;
  }

  propagateNotifications(notificationList: Notification[]) {
    throw notificationList;
  }

  propagateSensorReadEvent(event: SensorReadEvent) {
    for (const connection of this.clientConnectionMap.values()) {
      if (event.sensorId in connection.subscribedSensorIdx) {
        connection.resp.json(event);
      }
    }
  }
}
