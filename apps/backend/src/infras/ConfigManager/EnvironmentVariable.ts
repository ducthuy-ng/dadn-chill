import { ClientConfig } from 'pg';
import { ConfigManager } from '../../core/usecases/manager/ConfigManager';

export class MissingEnvVar implements Error {
  name: 'MissingEnvVar';
  message: string;

  constructor(varName: string) {
    this.message = `Missing environment variable: ${varName}`;
  }
}

export class EnvironmentVariablesProcessor implements ConfigManager {
  public static TRUE_SYMBOL = ['yes', 'true'];
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

  allowUsingRandomPortForUnitTesting(): boolean {
    if (!this.envVars['ALLOW_USING_RANDOM_PORT_FOR_UNIT_TEST']) {
      return false;
    }

    const enableAuthStatus = this.envVars['ALLOW_USING_RANDOM_PORT_FOR_UNIT_TEST'].toLowerCase();

    return EnvironmentVariablesProcessor.TRUE_SYMBOL.includes(enableAuthStatus);
  }

  getEnableAuthStatus(): boolean {
    if (!this.envVars['ENABLE_AUTH']) {
      return false;
    }

    const enableAuthStatus = this.envVars['ENABLE_AUTH'].toLowerCase();

    return EnvironmentVariablesProcessor.TRUE_SYMBOL.includes(enableAuthStatus);
  }
}
