import express, {
  Application,
  ErrorRequestHandler,
  Request,
  RequestHandler,
  Response,
  Router,
} from 'express';
import { query, validationResult } from 'express-validator';
import http, { Server } from 'http';
import { Logger } from '../../core/usecases/Logger';

import * as bodyParser from 'body-parser';
import cors from 'cors';
import { ClientIdNotFound } from '../../core/usecases/gateways/ClientManager';
import {
  SensorIdNotConnect,
  TransmissionError,
} from '../../core/usecases/gateways/SensorController';
import { DomainRegistry } from '../DomainRegistry';
import {
  BadRequestError,
  ClientIdMissing,
  FailedToForwardCommand,
  InternalServerError,
  InvalidSensorList,
  RequestClientIdNotFound,
  RequestSensorIdNotConnect,
  UnknownError,
  ValidationError,
} from './exceptions';
import { HttpClientManager } from './HttpClientManager';
import { convertToNotificationDto, NotificationDto } from './NotificationDto';
import { parseSensorCommand, validate } from './SensorCommandDto';
import { GenerateDto, SensorDto } from './SensorDto';

const DEFAULT_OFFSET = 0;
const DEFAULT_LIMIT = 10;

type ErrorMsg = {
  name: string;
  detail: string;
};

export class ExpressServer {
  private app: Application;
  private server: Server;

  private logger: Logger;

  constructor(httpClientManager: HttpClientManager, logger: Logger) {
    this.logger = logger;

    this.app = express();

    this.setupPreRouter();
    this.setupCORS();

    this.setupRestRouter();
    this.setupClientManagerRouter(httpClientManager);

    this.app.use(this.handleError);
  }

  private setupPreRouter() {
    this.app.set('view engine', 'html');
    this.app.use(this.handleLogging);
    this.app.use(bodyParser.json());
  }

  private setupCORS() {
    const frontendEndpoint = DomainRegistry.Instance.configManager.getFEEndpoint();
    const frontendEndpointList = frontendEndpoint.split(',');

    this.app.use(
      cors({
        origin: frontendEndpointList,
        credentials: true,
      })
    );
    this.logger.debug('Open CORS for Frontend', frontendEndpointList);
  }

  private setupRestRouter() {
    const router = express.Router();
    router.use('/health-check', this.setupHealthCheckRouter());
    router.use('/sensors', this.getSensorRouter());
    router.use('/notifications', this.getNotificationRouter());

    router.post('/command', this.handleCommandRequest);
    // TODO: router.get<null, SensorDto[] | ErrorMsg>('/sensor/:id', this.handleGetSensorList);

    this.app.use('/', router);
  }

  private setupHealthCheckRouter() {
    const router = express.Router();

    router.get('/', (_req, res) => {
      res.sendStatus(200);
    });

    return router;
  }

  private setupClientManagerRouter(restClientManager: HttpClientManager) {
    this.app.get('/streaming/subscribe', (_req, res) => {
      const subscribeClientUseCase = DomainRegistry.Instance.subscribeClientUC;
      const clientId = subscribeClientUseCase.execute();
      res.send(clientId);
    });

    this.app.post('/streaming/changeSubscription', (req, res) => {
      const changeSubscriptionUC = DomainRegistry.Instance.changeClientSubscriptionUC;

      if (!req.body['clientId'] || typeof req.body['clientId'] !== 'string')
        throw new ClientIdMissing('Body object missing clientId field');

      if (!this.isArrayOfSensorId(req.body['sensorIds']))
        throw new InvalidSensorList('Body should be an array of number (sensor IDs)');

      try {
        changeSubscriptionUC.execute(req.body['clientId'], req.body['sensorIds']);
        res.sendStatus(200);
      } catch (err) {
        if (err instanceof ClientIdNotFound)
          throw new RequestClientIdNotFound(`Client not subscribed yet ${err.message}`);
        throw err;
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
      this.validateRequest,
      this.handleGetAllSensors
    );

    return router;
  }

  private handleGetAllSensors: RequestHandler<null, SensorDto[]> = async (req, res, next) => {
    const getAllSensorsUC = DomainRegistry.Instance.getAllSensorsUC;

    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      const firstError = validationErrors.array()[0];
      throw new ValidationError(firstError.msg);
    }

    const offset = parseInt(String(req.query.offset)) || DEFAULT_OFFSET;
    const limit = parseInt(String(req.query.limit)) || DEFAULT_LIMIT;

    try {
      const [sensors, numOfSensor] = await getAllSensorsUC.execute(offset, limit);
      const sensorDtoList = sensors.map((sensor) => GenerateDto(sensor));
      res.set('X-Content-Size', numOfSensor.toString()).json(sensorDtoList);
    } catch (err) {
      next(err);
    }
  };

  private getNotificationRouter(): Router {
    const router = express.Router();
    router.get(
      '/',
      query('offset').optional().isInt().withMessage('Invalid query: offset'),
      query('limit').optional().isInt().withMessage('Invalid query: limit'),
      this.validateRequest,
      this.getNotificationList
    );

    return router;
  }

  private getNotificationList: RequestHandler<NotificationDto[]> = async (req, res) => {
    const getAllNotificationsUC = DomainRegistry.Instance.getAllNotificationsUC;

    const offset = parseInt(String(req.query.offset)) || DEFAULT_OFFSET;
    const limit = parseInt(String(req.query.limit)) || DEFAULT_LIMIT;

    const [notifications, notificationNum] = await getAllNotificationsUC.execute(offset, limit);
    const notificationDtoList = notifications.map(convertToNotificationDto);

    res.status(200).set('X-Content-Size', notificationNum.toString()).send(notificationDtoList);
  };

  private handleCommandRequest: RequestHandler<unknown, ErrorMsg> = async (req, res, next) => {
    const sensorController = DomainRegistry.Instance.sensorController;

    try {
      validate(req.body);
    } catch (err) {
      next(err);
      return;
    }

    const command = parseSensorCommand(req.body);

    try {
      await sensorController.forwardCommand(command);
      this.logger.debug('forward command', command);
      res.sendStatus(200);
    } catch (err) {
      if (err instanceof SensorIdNotConnect) next(new RequestSensorIdNotConnect(err.message));
      else if (err instanceof TransmissionError) next(new FailedToForwardCommand(err.message));
      else next(new UnknownError());
      return;
    }

    return;
  };

  private validateRequest(req: Request, _res: Response, next: () => void) {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      const firstError = validationErrors.array()[0];
      throw new ValidationError(firstError.msg);
    }

    next();
  }

  private handleLogging: RequestHandler = (req, res, next) => {
    this.logger.info(req.originalUrl);
    next();
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private handleError: ErrorRequestHandler<unknown, ErrorMsg> = (err, req, res, _next) => {
    this.logger.error(req.url, err.name || 'UnknownError');
    if (err instanceof BadRequestError)
      res.status(400).json({ name: err.name, detail: err.detail });
    else if (err instanceof InternalServerError)
      res.status(500).json({ name: err.name, detail: err.detail });
    else res.status(500).json({ name: 'UnknownError', detail: 'Please check the log for details' });
  };

  startListening(callback?: () => void) {
    const listeningPort = DomainRegistry.Instance.configManager.getExpressListeningPort();
    this.logger.info(`Start listening at port: ${listeningPort}`);

    this.server = http.createServer(this.app);
    this.server.listen(listeningPort, callback);
  }

  stopListening(callback?: () => void) {
    this.logger.info(`Shutting down`);
    this.server.close(callback);
  }

  use(path: string, callback: RequestHandler) {
    this.app.use(path, callback);
  }
}
