import { randomUUID } from 'crypto';
import express, { Application, Response } from 'express';
import { Server } from 'http';
import { Notification } from '../core/domain/Notification';
import { SensorId } from '../core/domain/Sensor';
import { SensorReadEvent } from '../core/domain/SensorReadEvent';
import { ClientId, ClientIdNotFound, ClientManager } from '../core/usecases/gateways/ClientManager';

type Connection = {
  subscribedSensorIdx: SensorId[];
  resp: Response;
};

export class ExpressServer implements ClientManager {
  private app: Application;
  private server: Server;
  private listeningPort: number;

  private clientConnectionMap: Map<ClientId, Connection>;

  constructor(listeningPort = 3333) {
    this.app = express();
    this.setupClientManagerRoute();

    this.clientConnectionMap = new Map();

    this.listeningPort = listeningPort;
  }

  private setupClientManagerRoute() {
    const router = express.Router();
    router.get<{ clientIdx: ClientId }>('/:clientIdx', (req, res) => {
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

  run(callback: () => void) {
    this.server = this.app.listen(this.listeningPort, callback);
  }

  close(callback: () => void) {
    this.server.close(callback);
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
