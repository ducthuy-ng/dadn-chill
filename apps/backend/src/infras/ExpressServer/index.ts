import express, { Application, RequestHandler, Router } from 'express';
import { query, validationResult } from 'express-validator';
import { Server } from 'http';
import { GetAllSensorUseCase, GetSingleSensorUseCase } from '../../core/usecases';
import { Logger } from '../../core/usecases/Logger';

import * as bodyParser from 'body-parser';
import cors from 'cors';
import { ChangeSubscriptionUseCase } from '../../core/usecases/ChangeSubscription';
import { ClientIdNotFound } from '../../core/usecases/gateways/ClientManager';
import { SensorController } from '../../core/usecases/gateways/SensorController';
import { GetAllNotificationsUseCase } from '../../core/usecases/GetAllNotifications';
import { ClientSubscribeUseCase } from '../../core/usecases/StartClient';
import { ErrorMsg } from './ErrorMsg';
import { HttpClientManager } from './HttpClientManager';
import { convertToNotificationDto, NotificationDto } from './NotificationDto';
import { parseSensorCommand, validate } from './SensorCommandDto';
import { GenerateDto, SensorDto } from './SensorDto';

const DEFAULT_OFFSET = 0;
const DEFAULT_LIMIT = 10;

export class ExpressServer {
  private app: Application;
  private server: Server;
  private listeningPort: number;

  private getSingleSensorUC: GetSingleSensorUseCase;
  private getSensorListUC: GetAllSensorUseCase;
  private getAllNotificationsUC: GetAllNotificationsUseCase;
  private clientSubscribeUC: ClientSubscribeUseCase;
  private changeSubscriptionUC: ChangeSubscriptionUseCase;

  private sensorController: SensorController;

  private logger: Logger;

  constructor(
    listeningPort = 3333,
    getSingleSensorUC: GetSingleSensorUseCase,
    getAllNotificationsUC: GetAllNotificationsUseCase,
    getSensorListUC: GetAllSensorUseCase,
    clientSubscribeUC: ClientSubscribeUseCase,
    changeSubscriptionUC: ChangeSubscriptionUseCase,
    httpClientManager: HttpClientManager,
    sensorController: SensorController,
    logger: Logger,
    frontendEndpoint = 'localhost:4200'
  ) {
    this.logger = logger;
    this.sensorController = sensorController;

    this.app = express();

    this.setupBodyParser();
    this.setupCORS(frontendEndpoint);
    this.setupRestRouter();
    this.setupClientManagerRouter(httpClientManager);
    this.setupPublic();


    this.listeningPort = listeningPort;

    this.getSingleSensorUC = getSingleSensorUC;
    this.getSensorListUC = getSensorListUC;
    this.getAllNotificationsUC = getAllNotificationsUC;
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
    router.use('/sensors', this.getSensorRouter());
    router.use('/notifications', this.getNotificationRouter());

    router.post('/command', this.handleCommandRequest);
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

  private getSensorRouter(): Router {
    const router = express.Router();

    router.get(
      '/',
      query('offset').optional().isInt().withMessage('Invalid query: offset'),
      query('limit').optional().isInt().withMessage('Invalid query: limit'),
      this.handleGetAllSensors
    );

    return router;
  }

  private handleGetAllSensors: RequestHandler<null, SensorDto[] | ErrorMsg> = async (req, res) => {
    this.logger.info('/sensors', req.url);

    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      const firstError = validationErrors.array()[0];
      res.status(400).json({
        name: 'ValidationError',
        detail: firstError.msg,
      });

      return;
    }

    const offset = parseInt(String(req.query.offset)) || DEFAULT_OFFSET;
    const limit = parseInt(String(req.query.limit)) || DEFAULT_LIMIT;

    try {
      const [sensors, numOfSensor] = await this.getSensorListUC.execute(offset, limit);

      const sensorDtoList = sensors.map((sensor) => GenerateDto(sensor));
      res.set('X-Content-Size', numOfSensor.toString()).json(sensorDtoList);
    } catch (err) {
      res.status(400).json({
        name: err.name || 'UnknownError',
        detail: err.detail || 'Please check the log',
      });
    }
  };

  private getNotificationRouter(): Router {
    const router = express.Router();
    router.get(
      '/',
      query('offset').optional().isInt().withMessage('Invalid query: offset'),
      query('limit').optional().isInt().withMessage('Invalid query: offset'),
      this.getNotificationList
    );

    return router;
  }

  private getNotificationList: RequestHandler<NotificationDto[] | ErrorMsg> = async (req, res) => {
    this.logger.debug('/notifications', req.url);

    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      const firstError = validationErrors.array()[0];
      res.status(400).json({
        name: 'ValidationError',
        detail: firstError.msg,
      });

      return;
    }

    const offset = parseInt(String(req.query.offset)) || DEFAULT_OFFSET;
    const limit = parseInt(String(req.query.limit)) || DEFAULT_LIMIT;

    try {
      const [notifications, notificationNum] = await this.getAllNotificationsUC.execute(
        offset,
        limit
      );

      const notificationDtoList = notifications.map(convertToNotificationDto);

      res.status(200).set('X-Content-Size', notificationNum.toString()).send(notificationDtoList);
    } catch (err) {
      this.logger.error('an error occurred while fetching /notifications', err);

      res.status(400).send({
        name: err.name || 'UnknownError',
        detail: err.message || 'Please check the log for details',
      });
    }
  };

  private handleCommandRequest: RequestHandler<unknown, ErrorMsg> = async (req, res) => {
    const validateResult = validate(req.body);

    if (!validateResult.success) {
      res.status(400).send({
        name: validateResult.errName,
        detail: validateResult.errMsg,
      });
      this.logger.debug('processed', req.url, req.body, validateResult.errMsg);
      return;
    }

    const command = parseSensorCommand(req.body);

    const result = await this.sensorController.forwardCommand(command);
    if (!result.success) {
      res.status(400).send({
        name: 'FailedToForwardCommand',
        detail: result.detail,
      });
      return;
    }

    res.sendStatus(200);
    return;
  };

  startListening(callback?: () => void) {
    this.server = this.app.listen(this.listeningPort, callback);
    this.logger.info(`Start listening at port: ${this.listeningPort}`);
  }

  stopListening(callback?: () => void) {
    this.logger.info(`Shutting down`);
    this.server.close(callback);
  }

  use(path: string, callback: RequestHandler) {
    this.app.use(path, callback);
  }
}
