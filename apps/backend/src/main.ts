/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */
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
import { RestClientManager } from './infras/ExpressServer/RestClientManager';
import { MqttEventMQ } from './infras/MqttEventMQ';
import { PGRepository } from './infras/PGRepository';

const envVarProcessor = new EnvironmentVariablesProcessor(process.env);

const PGRepo = new PGRepository(
  envVarProcessor.getPGConnString(),
  new BSLogger('PGRepo', { level: LogLevel.DEBUG })
);

const clientManager = new RestClientManager(new BSLogger('RestClientManager', {}));

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
  new BSLogger('MQTTServer', {})
);
eventMQ.onNewEvent(processReadEventUC);

const server = new ExpressServer(
  3333,
  getSingleSensorUC,
  getSensorListUC,
  clientSubscribeUC,
  changeSubscriptionUC,
  clientManager,
  new BSLogger('ExpressServer', {}),
  envVarProcessor.getFEEndpoint()
);

function startServers() {
  eventMQ.startListening();
  server.startListening();
}

async function closingServers() {
  server.stopListening();
  await eventMQ.stopListening();
}

startServers();
process.once('SIGINT', closingServers);
