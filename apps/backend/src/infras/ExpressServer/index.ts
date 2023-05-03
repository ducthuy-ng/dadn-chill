import express, {
  Application,
  ErrorRequestHandler,
  Request,
  RequestHandler,
  Response,
  Router,
} from 'express';
import { body, param, query, validationResult } from 'express-validator';
import http, { Server } from 'http';
import { Logger } from '../../core/usecases/Logger';

import * as bodyParser from 'body-parser';
import cors from 'cors';
import { AddressInfo } from 'net';
import { ClientIdNotFound } from '../../core/usecases/gateways/ClientManager';
import {
  SensorIdNotConnect,
  TransmissionError,
} from '../../core/usecases/gateways/SensorController';
import { SensorIdNotFound } from '../../core/usecases/repos/SensorRepo';
import { DomainRegistry } from '../DomainRegistry';
import {
  BadRequestError,
  ClientIdMissing,
  FailedToForwardCommand,
  InternalServerError,
  InvalidApiToken,
  InvalidCredential,
  InvalidSensorId,
  InvalidSensorList,
  RequestClientIdNotFound,
  RequestSensorIdNotConnect,
  Unauthorized,
  UnknownError,
  ValidationError,
} from './exceptions';
import { HttpClientManager } from './HttpClientManager';
import { convertToNotificationDto, NotificationDto } from './NotificationDto';
import { parseSensorCommand, validate } from './SensorCommandDto';
import { GenerateDto, SensorDto } from './SensorDto';
import { mapAnalysisResultToDto } from './StatisticDto';

const DEFAULT_OFFSET = 0;
const DEFAULT_LIMIT = 10;

const SECONDS_IN_MINUTE = 60;
const MILLISECONDS_IN_SECOND = 1000;

type ErrorMsg = {
  name: string;
  detail: string;
};

export class ExpressServer {
  private app: Application;
  private server: Server;

  private assignedApiToken = new Map();

  private domainRegistry: DomainRegistry;

  private logger: Logger;

  constructor(
    domainRegistry: DomainRegistry,
    httpClientManager: HttpClientManager,
    logger: Logger
  ) {
    this.logger = logger;
    this.domainRegistry = domainRegistry;

    this.app = express();

    this.setupPreRouter();
    this.setupCORS();

    this.setupRestRouter();
    this.setupClientManagerRouter(httpClientManager);

    this.app.use(this.handleError);
  }

  private setupPreRouter() {
    this.app.set('view engine', 'html');
    this.app.use(bodyParser.json());
  }

  private setupCORS() {
    const frontendEndpoint = this.domainRegistry.configManager.getFEEndpoint();
    const frontendEndpointList = frontendEndpoint.split(',');

    this.app.use(
      cors({
        origin: frontendEndpointList,
        credentials: true,
      })
    );
    this.logger.debug('Open CORS for Frontend', frontendEndpointList);
  }

  private AuthenticationMiddleware: RequestHandler = (req, res, next) => {
    const enableAuth = this.domainRegistry.configManager.getEnableAuthStatus();
    if (!enableAuth) {
      next();
      return;
    }

    if (!req.header('x-api-key')) {
      throw new Unauthorized();
    }
    const apiKey = req.header('x-api-key');

    if (!this.assignedApiToken.has(apiKey)) {
      throw new Unauthorized();
    }

    next();
  };

  private setupRestRouter() {
    const router = express.Router();
    router.use('/health-check', this.setupHealthCheckRouter());
    router.use('/sensors', this.AuthenticationMiddleware, this.getSensorRouter());
    router.use('/notifications', this.AuthenticationMiddleware, this.getNotificationRouter());

    router.post('/command', this.handleCommandRequest);
    // TODO: router.get<null, SensorDto[] | ErrorMsg>('/sensor/:id', this.handleGetSensorList);

    const enableAuth = this.domainRegistry.configManager.getEnableAuthStatus();
    this.logger.debug('enable authentication', enableAuth);
    if (enableAuth) {
      router.use('/auth', this.setupAuthRouter());
    }

    router.use('/statistics', this.AuthenticationMiddleware, this.setupStatisticRouter());

    this.app.use('/', router);
    this.app.use(this.handleLogging);
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
      const subscribeClientUseCase = this.domainRegistry.subscribeClientUC;
      const clientId = subscribeClientUseCase.execute();
      res.send(clientId);
    });

    this.app.post('/streaming/changeSubscription', (req, res) => {
      const changeSubscriptionUC = this.domainRegistry.changeClientSubscriptionUC;

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
    const getAllSensorsUC = this.domainRegistry.getAllSensorsUC;

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
    const getAllNotificationsUC = this.domainRegistry.getAllNotificationsUC;

    const offset = parseInt(String(req.query.offset)) || DEFAULT_OFFSET;
    const limit = parseInt(String(req.query.limit)) || DEFAULT_LIMIT;

    const [notifications, notificationNum] = await getAllNotificationsUC.execute(offset, limit);
    const notificationDtoList = notifications.map(convertToNotificationDto);

    res.status(200).set('X-Content-Size', notificationNum.toString()).send(notificationDtoList);
  };

  private handleCommandRequest: RequestHandler<unknown, ErrorMsg> = async (req, res, next) => {
    const sensorController = this.domainRegistry.sensorController;

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

  private setupAuthRouter() {
    const router = express.Router();

    router.post(
      '/login',
      body('email').notEmpty().isEmail(),
      body('password').notEmpty(),
      this.validateRequest,
      this.processLoginRequest
    );

    router.get('/logout', this.processLogoutRequest);

    return router;
  }

  private processLoginRequest: RequestHandler = async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    try {
      const newApiKey = await this.domainRegistry.loginUC.execute(email, password);
      if (!newApiKey) {
        next(new InvalidCredential());
        return;
      }

      this.assignedApiToken.set(
        newApiKey,
        setTimeout(
          () => this.assignedApiToken.delete(newApiKey),
          30 * SECONDS_IN_MINUTE * MILLISECONDS_IN_SECOND
        )
      );

      res.status(200).setHeader('x-api-key', newApiKey).send();
    } catch (err) {
      next(err);
    }
  };

  private processLogoutRequest: RequestHandler = (req, res, next) => {
    if (!req.header('x-api-key')) {
      next(new InvalidApiToken());
      return;
    }

    const apiToken = req.header('x-api-key');
    if (!this.assignedApiToken.has(apiToken)) {
      next(new InvalidApiToken());
      return;
    }

    clearTimeout(this.assignedApiToken.get(apiToken));
    this.assignedApiToken.delete(apiToken);

    res.status(200).send();
  };

  private setupStatisticRouter(): Router {
    const router = express.Router();

    router.post(
      '/',
      body('startDate')
        .isISO8601()
        .withMessage('startDate must be an ISO-8601 compliant timestamp'),
      body('startDate').isISO8601().withMessage('endDate must be an ISO-8601 compliant timestamp'),
      this.validateRequest,
      this.processGetAllSensorsStatistic
    );

    router.post(
      '/:sensorId',
      param('sensorId').isNumeric().withMessage('sensorId must be a number'),
      body('startDate')
        .isISO8601()
        .withMessage('startDate must be an ISO-8601 compliant timestamp'),
      body('startDate').isISO8601().withMessage('endDate must be an ISO-8601 compliant timestamp'),
      this.validateRequest,
      this.processStatisticForSensor
    );

    return router;
  }

  private processGetAllSensorsStatistic: RequestHandler = async (req, res, next) => {
    const startDate = req.body.startDate;
    const endDate = req.body.endDate;

    try {
      const useCase = this.domainRegistry.getTotalStatisticUC;
      const result = await useCase.execute(startDate, endDate);
      const analysisResultDto = mapAnalysisResultToDto(result);
      res.json(analysisResultDto);
    } catch (err) {
      next(err);
    }
  };

  private processStatisticForSensor: RequestHandler = async (req, res, next) => {
    const sensorId = parseInt(req.params.sensorId);
    const startDate = req.body.startDate;
    const endDate = req.body.endDate;

    try {
      const useCase = this.domainRegistry.getAnalysisDataForSensorUC;
      const result = await useCase.execute(sensorId, startDate, endDate);
      const analysisResultDto = mapAnalysisResultToDto(result);
      res.json(analysisResultDto);
    } catch (err) {
      if (err instanceof SensorIdNotFound) {
        next(new InvalidSensorId(sensorId));
      } else {
        next(err);
      }
    }
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
    this.logger.info('received request', req.originalUrl, req.query, req.body);
    next();
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private handleError: ErrorRequestHandler<unknown, ErrorMsg> = (err, req, res, _next) => {
    this.logger.error(req.url, err.name || 'UnknownError', err);

    if (err instanceof BadRequestError) {
      res.status(400).json({ name: err.name, detail: err.detail });
    } else if (err instanceof InternalServerError) {
      res.status(500).json({ name: err.name, detail: err.detail });
    } else if (err instanceof Unauthorized) {
      res.status(401).set('www-authenticate', 'basic').send();
    } else {
      res.status(500).json({ name: 'UnknownError', detail: 'Please check the log for details' });
    }
  };

  startListening(callback?: () => void): number {
    this.server = http.createServer(this.app);

    const useRandomPortForUnitTesting =
      this.domainRegistry.configManager.allowUsingRandomPortForUnitTesting();

    if (useRandomPortForUnitTesting) {
      this.server.listen(callback);
    } else {
      const listeningPort = this.domainRegistry.configManager.getExpressListeningPort();
      this.server.listen(listeningPort, callback);
    }

    const serverListeningPort = (this.server.address() as AddressInfo).port;
    this.logger.info('Start listening at port', serverListeningPort);

    return serverListeningPort;
  }

  stopListening(callback?: () => void) {
    this.logger.info(`Shutting down`);
    this.flushAllApiKey();
    this.server.close(callback);
  }

  private flushAllApiKey() {
    for (const [, timerId] of this.assignedApiToken) {
      clearTimeout(timerId);
    }
  }

  use(path: string, callback: RequestHandler) {
    this.app.use(path, callback);
  }
}
