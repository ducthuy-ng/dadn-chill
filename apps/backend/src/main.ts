import * as dotenv from 'dotenv';
dotenv.config();

import { SkipCheck } from './core/domain/LimitChecker/SkipCheck';
import {
  GetAllSensorUseCase,
  GetSingleSensorUseCase,
  ProcessReadEventUseCase,
} from './core/usecases';
import { ChangeSubscriptionUseCase } from './core/usecases/ChangeSubscription';
import { GetAllNotificationsUseCase } from './core/usecases/GetAllNotifications';
import { LogLevel } from './core/usecases/Logger';
import { ClientSubscribeUseCase } from './core/usecases/StartClient';
import { BSLogger } from './infras/BSLogger';
import { EnvironmentVariablesProcessor } from './infras/EnvironmentVariable';
import { ExpressServer } from './infras/ExpressServer';
import { MqttEventMQ } from './infras/MqttEventMQ';
import { MqttSensorController } from './infras/MqttSensorController';
import { PGRepository } from './infras/PGRepository';
import { SseClientManager } from './infras/SseClientManager';
import express from 'express';
import path from 'path';

const envVarProcessor = new EnvironmentVariablesProcessor(process.env);

const PGRepo = new PGRepository(
  envVarProcessor.getPGConnectionConfigs(),
  new BSLogger('PGRepo', { level: LogLevel.DEBUG })
);

// const clientManager = new RestClientManager(new BSLogger('RestClientManager', {}));
const clientManager = new SseClientManager({
  logger: new BSLogger('SseClientManager', {}),
});

const sensorController = new MqttSensorController(
  envVarProcessor.getMqttHostname(),
  new BSLogger('MqttServerController', {})
);
sensorController.populateSensors(PGRepo);

const getSingleSensorUC = new GetSingleSensorUseCase(PGRepo);
const getAllSensorUsecase = new GetAllSensorUseCase(PGRepo);
const getAllNotificationsUC = new GetAllNotificationsUseCase(PGRepo);
const clientSubscribeUC = new ClientSubscribeUseCase(clientManager);
const changeSubscriptionUC = new ChangeSubscriptionUseCase(clientManager);

const processReadEventUC = new ProcessReadEventUseCase(
  PGRepo,
  PGRepo,
  new SkipCheck(),
  clientManager,
  PGRepo
);

const eventMQ = new MqttEventMQ(
  envVarProcessor.getMqttHostname(),
  'chill-topic',
  new BSLogger('MqttEventMQ', {})
);
eventMQ.onNewEvent(processReadEventUC);

const server = new ExpressServer(
  envVarProcessor.getExpressListeningPort(),
  getSingleSensorUC,
  getAllNotificationsUC,
  getAllSensorUsecase,
  clientSubscribeUC,
  changeSubscriptionUC,
  clientManager,
  sensorController,
  new BSLogger('ExpressServer', {}),
  envVarProcessor.getFEEndpoint()
);

server.use('/doc', express.static(path.join(__dirname, 'assets')));

async function startServers() {
  await sensorController.startServer();
  eventMQ.startListening();
  server.startListening();
}

async function closingServers() {
  await sensorController.stopServer();
  await PGRepo.disconnect();
  server.stopListening();
  await eventMQ.stopListening();
}

startServers();
process.once('SIGINT', closingServers);
process.once('SIGTERM', closingServers);
