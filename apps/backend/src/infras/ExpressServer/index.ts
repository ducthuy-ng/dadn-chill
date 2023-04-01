import express, { Application, RequestHandler } from 'express';
import { Server } from 'http';
import { GetSensorListUseCase, GetSingleSensorUseCase } from '../../core/usecases';
import { Logger } from '../../core/usecases/Logger';
import { PageOutOfRange } from '../../core/usecases/repos/SensorRepo';

import * as bodyParser from 'body-parser';
import cors from 'cors';
import { ChangeSubscriptionUseCase } from '../../core/usecases/ChangeSubscription';
import { ClientIdNotFound } from '../../core/usecases/gateways/ClientManager';
import { ClientSubscribeUseCase } from '../../core/usecases/StartClient';
import { ErrorMsg } from './ErrorMsg';
import { HttpClientManager } from './HttpClientManager';
import { GenerateDto, SensorDto } from './SensorDto';

export class ExpressServer {
  private app: Application;
  private server: Server;
  private listeningPort: number;

  private getSingleSensorUC: GetSingleSensorUseCase;
  private getSensorListUC: GetSensorListUseCase;
  private clientSubscribeUC: ClientSubscribeUseCase;
  private changeSubscriptionUC: ChangeSubscriptionUseCase;

  private logger: Logger;

  constructor(
    listeningPort = 3333,
    getSingleSensorUC: GetSingleSensorUseCase,
    getSensorListUC: GetSensorListUseCase,
    clientSubscribeUC: ClientSubscribeUseCase,
    changeSubscriptionUC: ChangeSubscriptionUseCase,
    httpClientManager: HttpClientManager,
    logger: Logger,
    frontendEndpoint = 'localhost:4200'
  ) {
    this.logger = logger;

    this.app = express();

    this.setupBodyParser();
    this.setupCORS(frontendEndpoint);
    this.setupRestRouter();
    this.setupClientManagerRouter(httpClientManager);
    this.setupPublic();


    this.listeningPort = listeningPort;

    this.getSingleSensorUC = getSingleSensorUC;
    this.getSensorListUC = getSensorListUC;
    this.clientSubscribeUC = clientSubscribeUC;
    this.changeSubscriptionUC = changeSubscriptionUC;
  }

  private setupPublic() {
    this.app.set('view engine', 'html');
  }

  private setupBodyParser() {
    this.app.use(bodyParser.json());
  }

  private setupCORS(frontendEndpoint: string) {
    const frontendEndpointList = frontendEndpoint.split(',');
    this.logger.debug('Open CORS for Frontend', frontendEndpointList);

    this.app.use(
      cors({
        origin: frontendEndpointList,
        credentials: true,
      })
    );
  }

  private setupRestRouter() {
    const router = express.Router();
    router.get<null, SensorDto[] | ErrorMsg>('/sensors', this.handleGetSensorList);
    // TODO: router.get<null, SensorDto[] | ErrorMsg>('/sensor/:id', this.handleGetSensorList);

    this.app.use('/', router);
  }

  private setupClientManagerRouter(restClientManager: HttpClientManager) {
    this.app.get('/streaming/subscribe', (req, res) => {
      const clientId = this.clientSubscribeUC.execute();
      res.send(clientId);
    });

    this.app.post('/streaming/changeSubscription', (req, res) => {
      if (!req.body['clientId'] || typeof req.body['clientId'] !== 'string') {
        res.status(400).json({
          name: 'ClientIdMissing',
          detail: 'Body object missing clientId field',
        });
        return;
      }

      if (!this.isArrayOfSensorId(req.body['sensorIds'])) {
        res.status(400).json({
          name: 'InvalidSensorList',
          detail: 'Body should be an array of number (sensor IDs)',
        });
        return;
      }

      try {
        this.changeSubscriptionUC.execute(req.body['clientId'], req.body['sensorIds']);
        res.sendStatus(200);
      } catch (err) {
        res.status(400);
        if (err instanceof ClientIdNotFound) {
          res.json({
            name: 'ClientIdNotFound',
            detail: 'Client not subscribed yet.',
          });
          return;
        }

        res.json({
          name: 'InternalError',
          detail: 'Internal error occurred',
        });
      }
    });

    this.app.use('/streaming', restClientManager.getListeningRouter());
  }

  private isArrayOfSensorId(object: unknown): boolean {
    return Array.isArray(object) && object.every((element) => typeof element === 'number');
  }

  private handleGetSensorList: RequestHandler<null, SensorDto[] | ErrorMsg> = async (req, res) => {
    let pageNum = parseInt(String(req.query.pageNum));

    if (isNaN(pageNum)) pageNum = 1;
    this.logger.info('/sensors', pageNum);

    if (pageNum <= 0) {
      res.status(400).json({
        name: 'InvalidPageNum',
        detail: 'pageNum should be greater than zero',
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

  startListening() {
    this.server = this.app.listen(this.listeningPort);
    this.logger.info(`Start listening at port: ${this.listeningPort}`);
  }

  stopListening() {
    this.logger.info(`Shutting down`);
    this.server.close();
  }

  use(path: string, callback: RequestHandler) {
    this.app.use(path, callback);
  }
}
