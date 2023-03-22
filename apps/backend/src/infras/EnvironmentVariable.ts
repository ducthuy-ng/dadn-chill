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

  public getFEEndpoint(): string {
    if (!this.envVars['FRONTEND_ENDPOINT']) throw new MissingEnvVar('FRONTEND_ENDPOINT');

    return this.envVars['FRONTEND_ENDPOINT'];
  }

  public getMqttHostname(): string {
    if (!this.envVars['MQTT_HOSTNAME']) throw new MissingEnvVar('FRONTEND_ENDPOINT');

    return this.envVars['MQTT_HOSTNAME'];
  }
}
