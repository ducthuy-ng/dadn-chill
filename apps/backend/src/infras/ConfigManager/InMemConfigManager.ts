import { ClientConfig } from 'pg';
import { ConfigManager } from '../../core/usecases/manager/ConfigManager';

export class InMemConfigManager implements ConfigManager {
  pgConnectionConfigs?: ClientConfig;
  FEEndpoint = 'http://localhost:4200';
  MqttHostname?: string;

  ExpressListeningPort?: number;

  getPGConnectionConfigs(): ClientConfig {
    return this.pgConnectionConfigs;
  }

  getFEEndpoint(): string {
    return this.FEEndpoint;
  }

  getMqttHostname(): string {
    return this.MqttHostname;
  }

  getExpressListeningPort(): number {
    return this.ExpressListeningPort;
  }
}
