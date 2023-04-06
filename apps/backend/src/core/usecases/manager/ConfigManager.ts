import { ClientConfig } from 'pg';

export interface ConfigManager {
  getPGConnectionConfigs(): ClientConfig;
  getFEEndpoint(): string;
  getMqttHostname(): string;
  getExpressListeningPort(): number;
}
