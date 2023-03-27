import { Router } from 'express';
import { ClientManager } from '../../core/usecases/gateways/ClientManager';

export interface HttpClientManager extends ClientManager {
  getListeningRouter(): Router;
}
