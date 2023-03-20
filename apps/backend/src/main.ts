/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { env } from 'process';
import { GetSensorListUseCase, GetSingleSensorUseCase } from './core/usecases';
import { LogLevel } from './core/usecases/Logger';
import { BSLogger } from './infras/BSLogger';
import { EnvironmentVariablesProcessor } from './infras/EnvironmentVariable';
import { ExpressServer } from './infras/ExpressServer';
import { PGRepository } from './infras/PGRepository';

const envVarProcessor = new EnvironmentVariablesProcessor(env);

const sensorRepo = new PGRepository(
  envVarProcessor.getPGConnString(),
  new BSLogger('PGRepo', { level: LogLevel.DEBUG })
);
const getSingleSensorUC = new GetSingleSensorUseCase(sensorRepo);
const getSensorListUC = new GetSensorListUseCase(sensorRepo);

const server = new ExpressServer(
  3333,
  getSingleSensorUC,
  getSensorListUC,
  new BSLogger('ExpressServer', {}),
  envVarProcessor.getFEEndpoint()
);

function startServers() {
  server.startListening();
}

async function closingServers() {
  server.stopListening();
}

startServers();
process.once('SIGINT', closingServers);
