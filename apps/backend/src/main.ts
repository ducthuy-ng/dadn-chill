import * as dotenv from 'dotenv';
dotenv.config();

import { SkipCheck } from './core/domain/LimitChecker/SkipCheck';
import {
  GetSensorListUseCase,
  GetSingleSensorUseCase,
  ProcessReadEventUseCase,
} from './core/usecases';
import { ChangeSubscriptionUseCase } from './core/usecases/ChangeSubscription';
import { LogLevel } from './core/usecases/Logger';
import { ClientSubscribeUseCase } from './core/usecases/StartClient';
import { BSLogger } from './infras/BSLogger';
import { EnvironmentVariablesProcessor } from './infras/EnvironmentVariable';
import { ExpressServer } from './infras/ExpressServer';
import { MqttEventMQ } from './infras/MqttEventMQ';
import { MqttSensorController } from './infras/MqttSensorController';
import { PGRepository } from './infras/PGRepository';
import { SseClientManager } from './infras/SseClientManager';

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
const getSensorListUC = new GetSensorListUseCase(PGRepo);
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
  getSensorListUC,
  clientSubscribeUC,
  changeSubscriptionUC,
  clientManager,
  sensorController,
  new BSLogger('ExpressServer', {}),
  envVarProcessor.getFEEndpoint()
);

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
