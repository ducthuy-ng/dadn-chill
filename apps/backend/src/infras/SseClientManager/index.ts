import { randomUUID } from 'crypto';
import { Application, Response } from 'express';
import { Notification } from '../../core/domain/Notification';
import { SensorId } from '../../core/domain/Sensor';
import { SensorReadEvent } from '../../core/domain/SensorReadEvent';
import { ClientId, ClientManager } from '../../core/usecases/gateways/ClientManager';
import { Logger } from '../../core/usecases/Logger';

type ClientDetails = {
  connection?: Response;
  timeOutId?: NodeJS.Timeout;
  subscribedSensorIds: SensorId[];
};

type ClientMap = Map<ClientId, ClientDetails>;

type Configs = {
  expressApp: Application;
  bindRoute?: string;
  logger: Logger;
};

const SECONDS_IN_MILLISECONDS = 1000;

export class SseClientManager implements ClientManager {
  public static SECONDS_SINCE_LAST_CONNECTED = 300;

  private logger: Logger;
  private clientMap: ClientMap = new Map();

  constructor(configs: Configs) {
    this.logger = configs.logger;
    this.bindListeningRouteTo(configs.expressApp, configs.bindRoute);
  }

  private bindListeningRouteTo(expressApp: Application, bindRoute = '/streaming') {
    const fullBindRoute = bindRoute + '/:clientId';
    expressApp.get(fullBindRoute, (req, res) => {
      this.logger.debug('received request', req.url);
      const clientId = req.params['clientId'];
      this.logger.debug('received request', req.url);

      const clientDetail = this.clientMap.get(clientId);
      if (!clientDetail) {
        this.logger.debug('ClientId not found', clientId);
        this.sendUnsubscribedId(res);
        return;
      }

      this.logger.info('client connected', clientId);

      clientDetail.connection = res;
      clearTimeout(clientDetail.timeOutId);

      this.logger.debug('client detail', clientDetail);

      res.on('close', () => this.handleCloseResp(clientId, clientDetail));
    });
  }

  private sendUnsubscribedId(res: Response) {
    res.status(400).json({
      name: 'ClientIdNotFound',
      detail: 'It seems like you have not subscribed.',
    });
  }

  private sendSseHeader(res: Response) {
    const sseHeaders = {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    };

    res.writeHead(200, sseHeaders);
  }

  private handleCloseResp(clientId: ClientId, clientDetail: ClientDetails) {
    this.logger.info('client disconnected');
    clientDetail.timeOutId = setTimeout(() => {
      this.clientMap.delete(clientId);
    }, SseClientManager.SECONDS_SINCE_LAST_CONNECTED * SECONDS_IN_MILLISECONDS);
  }

  generateNewClientId(): ClientId {
    const newClientId = randomUUID();
    this.logger.info('new client joined', newClientId);

    return newClientId;
  }

  openConnectionToClient(id: string): void {
    this.clientMap.set(id, {
      connection: null,
      timeOutId: setTimeout(() => {
        this.clientMap.delete(id);
      }, SseClientManager.SECONDS_SINCE_LAST_CONNECTED * SECONDS_IN_MILLISECONDS),
      subscribedSensorIds: [],
    });
  }

  changeClientSubscription(clientId: string, sensorIds: SensorId[]): void {
    const clientDetail = this.clientMap.get(clientId);
    if (!clientDetail) {
      return;
    }

    clientDetail.subscribedSensorIds = sensorIds;
  }

  propagateNotifications(notificationList: Notification[]): void {
    throw new Error('Method not implemented.');
  }

  propagateSensorReadEvent(event: SensorReadEvent): void {
    this.clientMap.forEach((clientDetails) => {
      this.logger.debug('received event', event);

      if (clientDetails.connection && clientDetails.subscribedSensorIds.includes(event.sensorId)) {
        this.logger.debug('message', this.serialize(event));
        this.logger.debug('client', clientDetails.connection);
        clientDetails.connection.write(this.serialize(event));
      }
    });
  }

  private serialize(data: unknown) {
    return `${JSON.stringify(data)}\n\n`;
  }
}
