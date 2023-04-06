import { ClientConfig } from 'pg';

export class MissingEnvVar implements Error {
  name: 'MissingEnvVar';
  message: string;

  constructor(varName: string) {
    this.message = `Missing environment variable: ${varName}`;
  }
}

export class EnvironmentVariablesProcessor {
  private envVars: NodeJS.ProcessEnv;

  constructor(processEnv: NodeJS.ProcessEnv) {
    this.envVars = processEnv;
  }

  public getPGConnString(): string {
    if (!this.envVars['POSTGRES_CONNECTION_STRING'])
      throw new MissingEnvVar('POSTGRES_CONNECTION_STRING');

    return this.envVars['POSTGRES_CONNECTION_STRING'];
  }

  public getPGConnectionConfigs(): ClientConfig {
    if (!this.envVars['POSTGRES_USER']) throw new MissingEnvVar('POSTGRES_USER');
    if (!this.envVars['POSTGRES_PASSWORD']) throw new MissingEnvVar('POSTGRES_PASSWORD');
    if (!this.envVars['POSTGRES_HOST']) throw new MissingEnvVar('POSTGRES_HOST');

    return {
      user: this.envVars['POSTGRES_USER'],
      password: this.envVars['POSTGRES_PASSWORD'],
      database: this.envVars['POSTGRES_DB'] || this.envVars['POSTGRES_PASSWORD'],
      host: this.envVars['POSTGRES_HOST'],
      port: parseInt(this.envVars['POSTGRES_PORT']) || 5432,
    };
  }

  public getFEEndpoint(): string {
    if (!this.envVars['FRONTEND_ENDPOINT']) throw new MissingEnvVar('FRONTEND_ENDPOINT');

    return this.envVars['FRONTEND_ENDPOINT'];
  }

  public getMqttHostname(): string {
    if (!this.envVars['MQTT_HOSTNAME']) throw new MissingEnvVar('MQTT_HOSTNAME');

    return this.envVars['MQTT_HOSTNAME'];
  }

  public getExpressListeningPort(): number {
    return parseInt(this.envVars['EXPRESS_PORT']) || 3333;
  }
}
