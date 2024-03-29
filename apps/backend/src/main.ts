import * as dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import path from 'path';
import { SkipCheck } from './core/domain/LimitChecker/SkipCheck';
import {
  ForwardNotificationUseCase,
  GetAllSensorUseCase,
  GetAnalysisDataForSensorUseCase,
  GetSingleSensorUseCase,
  GetTotalAnalysisDataUseCase,
  ProcessReadEventUseCase,
} from './core/usecases';
import { ChangeSubscriptionUseCase } from './core/usecases/ChangeSubscription';
import { GetAllNotificationsUseCase } from './core/usecases/GetAllNotifications';
import { LogLevel } from './core/usecases/Logger';
import { LoginUseCase } from './core/usecases/Login';
import { ClientSubscribeUseCase } from './core/usecases/StartClient';
import { BSLogger } from './infras/BSLogger';
import { EnvironmentVariablesProcessor } from './infras/ConfigManager/EnvironmentVariable';
import { DomainRegistry } from './infras/DomainRegistry';
import { ExpressServer } from './infras/ExpressServer';
import { MqttEventMQ } from './infras/MqttEventMQ';
import { MqttSensorController } from './infras/MqttSensorController';
import { PGRepository } from './infras/PGRepository';
import { SseClientManager } from './infras/SseClientManager';

const domainRegistry = new DomainRegistry();
domainRegistry.logger = new BSLogger('DomainRegistry', { level: LogLevel.DEBUG });

domainRegistry.configManager = new EnvironmentVariablesProcessor(process.env);

const PGRepo = new PGRepository(
  domainRegistry.configManager.getPGConnectionConfigs(),
  new BSLogger('PGRepo', { level: LogLevel.DEBUG })
);
domainRegistry.notificationRepo = PGRepo;
domainRegistry.sensorRepo = PGRepo;

// const clientManager = new RestClientManager(new BSLogger('RestClientManager', {}));
const clientManager = new SseClientManager({
  logger: new BSLogger('SseClientManager', {}),
});
domainRegistry.clientManager = clientManager;

const sensorController = new MqttSensorController(
  domainRegistry.configManager.getMqttHostname(),
  new BSLogger('MqttServerController', {})
);
sensorController.populateSensors(PGRepo);

domainRegistry.getSingleSensorUC = new GetSingleSensorUseCase(PGRepo);
domainRegistry.getAllSensorsUC = new GetAllSensorUseCase(PGRepo);
domainRegistry.getAllNotificationsUC = new GetAllNotificationsUseCase(PGRepo);
domainRegistry.subscribeClientUC = new ClientSubscribeUseCase(clientManager);
domainRegistry.changeClientSubscriptionUC = new ChangeSubscriptionUseCase(clientManager);
domainRegistry.getTotalStatisticUC = new GetTotalAnalysisDataUseCase(domainRegistry);
domainRegistry.getAnalysisDataForSensorUC = new GetAnalysisDataForSensorUseCase(domainRegistry);
domainRegistry.loginUC = new LoginUseCase(domainRegistry);
domainRegistry.forwardNotificationUC = new ForwardNotificationUseCase(domainRegistry);

domainRegistry.userRepo = PGRepo;
domainRegistry.analysisTool = PGRepo;

domainRegistry.sensorController = sensorController;

const processReadEventUC = new ProcessReadEventUseCase(
  PGRepo,
  PGRepo,
  new SkipCheck(),
  clientManager,
  PGRepo
);

const eventMQ = new MqttEventMQ(
  domainRegistry.configManager.getMqttHostname(),
  'chill-topic',
  new BSLogger('MqttEventMQ', {})
);
eventMQ.onNewEvent(processReadEventUC);

const server = new ExpressServer(domainRegistry, new BSLogger('ExpressServer', {}), clientManager);

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

domainRegistry.listAllUninitializedObjects();
startServers();
process.once('SIGINT', closingServers);
process.once('SIGTERM', closingServers);
