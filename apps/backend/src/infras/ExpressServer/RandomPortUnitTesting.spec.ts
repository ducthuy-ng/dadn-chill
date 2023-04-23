import axios from 'axios';
import { ExpressServer } from '.';
import { BSLogger } from '../BSLogger';
import { InMemConfigManager } from '../ConfigManager/InMemConfigManager';
import { DomainRegistry } from '../DomainRegistry';
import { sleep } from '../testingTools';

const configs = new InMemConfigManager();
configs.ExpressListeningPort = 3334;
DomainRegistry.Instance.configManager = configs;

describe('Testing `RandomPort` feature', () => {
  it('should use a random port if enable this config', async () => {
    configs.randomOverridePortForUnitTesting = true;

    const server = new ExpressServer(
      DomainRegistry.Instance,
      new BSLogger('express-server-test', {})
    );

    const listeningPort = server.startListening();
    await sleep(2);

    server.stopListening();
    await sleep(2);

    expect(listeningPort).not.toBeNull();
  });

  it('should use a random port, fetch-able if enable this config', async () => {
    configs.randomOverridePortForUnitTesting = true;

    const server = new ExpressServer(
      DomainRegistry.Instance,
      new BSLogger('express-server-test', {})
    );

    const listeningPort = server.startListening();
    await sleep(2);

    const resp = await axios.get(`http://localhost:${listeningPort}/health-check`, {
      validateStatus: () => true,
    });

    server.stopListening();
    await sleep(2);

    expect(resp.status).toBe(200);
  });

  it('should use the specified port (3334) if disable this config', async () => {
    configs.randomOverridePortForUnitTesting = false;

    const server = new ExpressServer(
      DomainRegistry.Instance,
      new BSLogger('express-server-test', {})
    );

    const listeningPort = server.startListening();
    await sleep(2);

    server.stopListening();
    await sleep(2);

    expect(listeningPort).toBe(3334);
  });
});
