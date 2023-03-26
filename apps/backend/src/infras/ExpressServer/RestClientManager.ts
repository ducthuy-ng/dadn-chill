import { randomUUID } from 'crypto';
import express, { Router } from 'express';

import { Notification } from '../../core/domain/Notification';
import { SensorId } from '../../core/domain/Sensor';
import { SensorReadEvent } from '../../core/domain/SensorReadEvent';
import { ClientId, ClientIdNotFound } from '../../core/usecases/gateways/ClientManager';
import { Logger } from '../../core/usecases/Logger';
import { HttpClientManager } from './HttpClientManager';

type ClientDetail = {
  subscribedSensorIdx: SensorId[];
  eventMQ: SensorReadEvent[];
};

export class RestClientManager implements HttpClientManager {
  private clientBuffer: Map<ClientId, ClientDetail>;

  private router: Router;

  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
    this.clientBuffer = new Map();

    this.setupRouter();
  }

  private setupRouter() {
    this.router = express.Router();
    this.router.get('/events/:clientId', (req, res) => {
      if (!req.params['clientId']) {
        res.status(400).json({
          name: 'InvalidQuery',
          detail: 'Client Id does not exist in query',
        });
        return;
      }

      const clientId = String(req.params['clientId']);

      if (!this.clientBuffer.has(clientId)) {
        res.status(400).json({
          name: 'ClientIdNotFound',
          detail: 'Client Id has not subscribed',
        });
        return;
      }

      const clientDetail = this.clientBuffer.get(clientId);
      res.json(clientDetail.eventMQ);

      clientDetail.eventMQ = [];
      this.clientBuffer.set(clientId, clientDetail);
    });
  }

  getListeningRouter(): express.Router {
    return this.router;
  }

  generateNewClientId(): ClientId {
    const newClientId = randomUUID();
    this.logger.info('New client subscription', newClientId);
    return newClientId;
  }

  openConnectionToClient(id: ClientId): void {
    this.clientBuffer.set(id, {
      subscribedSensorIdx: [],
      eventMQ: [],
    });
  }

  changeClientSubscription(clientId: ClientId, sensorIdx: SensorId[]): void {
    if (!this.clientBuffer.has(clientId)) {
      throw new ClientIdNotFound(clientId);
    }

    const clientDetail = this.clientBuffer.get(clientId);
    clientDetail.subscribedSensorIdx = sensorIdx;
    this.clientBuffer.set(clientId, clientDetail);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  propagateNotifications(notificationList: Notification[]) {
    return;
  }

  propagateSensorReadEvent(event: SensorReadEvent) {
    this.clientBuffer.forEach((clientDetail) => {
      if (clientDetail.subscribedSensorIdx.includes(event.sensorId))
        clientDetail.eventMQ.push(event);
    });
  }
}
