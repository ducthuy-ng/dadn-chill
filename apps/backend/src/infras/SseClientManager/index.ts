import { randomUUID } from 'crypto';
import { Response, Router } from 'express';
import { Notification } from '../../core/domain/Notification';
import { SensorId } from '../../core/domain/Sensor';
import { SensorReadEvent } from '../../core/domain/SensorReadEvent';
import { ClientId, ClientManager } from '../../core/usecases/gateways/ClientManager';
import { Logger } from '../../core/usecases/Logger';
import { HttpClientManager } from '../ExpressServer/HttpClientManager';
import { NotificationDto } from './NotificationDto';

type ClientDetails = {
  connection?: Response;
  timeOutId?: NodeJS.Timeout;
  subscribedSensorIds: SensorId[];
};

type ClientMap = Map<ClientId, ClientDetails>;

type Configs = {
  logger: Logger;
};

const SECONDS_IN_MILLISECONDS = 1000;

export class SseClientManager implements HttpClientManager {
  public static SECONDS_SINCE_LAST_CONNECTED = 300;

  private logger: Logger;
  private clientMap: ClientMap = new Map();

  private router: Router;

  constructor(configs: Configs) {
    this.logger = configs.logger;
  }

  public stopListening() {
    this.clientMap.forEach((clientDetails) => {
      clearTimeout(clientDetails.timeOutId);
    });

    delete this.clientMap;
  }

  public getListeningRouter(): Router {
    this.router = Router();
    this.router.get('/:clientId', (req, res) => {
      const clientId = req.params['clientId'];

      const clientDetail = this.clientMap.get(clientId);
      if (!clientDetail) {
        this.logger.debug('ClientId not found', clientId);
        this.sendUnsubscribedId(res);
        return;
      }

      this.logger.info('client connected', clientId);
      this.sendSseHeader(res);

      clientDetail.connection = res;
      clearTimeout(clientDetail.timeOutId);

      res.on('close', () => this.handleCloseResp(clientId, clientDetail));
    });

    return this.router;
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

    clientDetail.connection.destroy();
    clientDetail.connection = null;
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
    this.logger.debug('propagating notifications');

    this.clientMap.forEach((clientDetails) => {
      if (!clientDetails.connection) return;

      for (const notification of notificationList) {
        const dto = this.encodeNotificationDto(notification);
        clientDetails.connection.write(`event: notification\ndata: ${JSON.stringify(dto)}\n\n`);
      }
    });
  }

  private encodeNotificationDto(notification: Notification): NotificationDto {
    return {
      id: notification.id,
      idOfOriginSensor: notification.idOfOriginSensor,
      nameOfOriginSensor: notification.nameOfOriginSensor,

      createTimestamp: notification.createdDate.toISOString(),

      header: notification.header,
      content: notification.content,
    };
  }

  propagateSensorReadEvent(event: SensorReadEvent): void {
    this.logger.debug('forwarding event', event);

    this.clientMap.forEach((clientDetails) => {
      if (!clientDetails.connection || !clientDetails.subscribedSensorIds.includes(event.sensorId))
        return;

      clientDetails.connection.write(`event: sensorEvent\ndata: ${JSON.stringify(event)}\n\n`);
    });
  }
}
