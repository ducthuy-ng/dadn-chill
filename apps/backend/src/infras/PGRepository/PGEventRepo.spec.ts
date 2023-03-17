import { PGRepository } from '.';
import { FailedToStoreEvent } from '../../core/usecases/repos/ReadEventRepo';

describe('PGEventRepo test', () => {
  let sensorRepo: PGRepository;

  beforeAll(async () => {
    sensorRepo = new PGRepository('postgresql://backend:password@localhost:5432/backend', false);
  });

  afterAll(async () => {
    await sensorRepo.disconnect();
  });

  test('Insert should not throw', async () => {
    expect(() => {
      sensorRepo.storeEvent({
        sensorId: 1,
        readTimestamp: new Date().toISOString(),
        sensorValue: {
          temperature: 1,
          humidity: 1,
          lightIntensity: 1,
          earthMoisture: 1,
        },
      });
    }).not.toThrow(FailedToStoreEvent);
  });
});
