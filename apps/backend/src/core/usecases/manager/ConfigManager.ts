import { ClientConfig } from 'pg';

export interface ConfigManager {
  getPGConnectionConfigs(): ClientConfig;
  getFEEndpoint(): string;
  getMqttHostname(): string;

  allowUsingRandomPortForUnitTesting(): boolean;
  getExpressListeningPort(): number;
  getEnableAuthStatus(): boolean;
}
