import { ClientConfig } from 'pg';
import { ConfigManager } from '../../core/usecases/manager/ConfigManager';

export class InMemConfigManager implements ConfigManager {
  pgConnectionConfigs?: ClientConfig;
  FEEndpoint = 'http://localhost:4200';
  MqttHostname?: string;

  randomOverridePortForUnitTesting = false;
  ExpressListeningPort?: number;
  enableRestAuth = false;

  getPGConnectionConfigs(): ClientConfig {
    return this.pgConnectionConfigs;
  }

  getFEEndpoint(): string {
    return this.FEEndpoint;
  }

  getMqttHostname(): string {
    return this.MqttHostname;
  }

  allowUsingRandomPortForUnitTesting(): boolean {
    return this.randomOverridePortForUnitTesting;
  }

  getExpressListeningPort(): number {
    return this.ExpressListeningPort;
  }

  getEnableAuthStatus(): boolean {
    return this.enableRestAuth;
  }
}
