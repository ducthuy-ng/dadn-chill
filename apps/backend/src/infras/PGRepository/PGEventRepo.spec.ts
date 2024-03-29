import { Pool } from 'pg';
import { PGRepository } from '.';
import { BSLogger } from '../BSLogger';

describe('PGEventRepo test', () => {
  let sensorRepo: PGRepository;

  const pgConnString = 'postgresql://backend:password@localhost:5432/backend';
  const pgPool = new Pool({ connectionString: pgConnString });

  const dummyLogger = new BSLogger('test logger', {});
  beforeAll(async () => {
    sensorRepo = new PGRepository(
      { host: 'localhost', user: 'backend', password: 'password', database: 'backend' },
      dummyLogger
    );
  });

  afterAll(async () => {
    await pgPool.end();
    await sensorRepo.disconnect();
  });

  test('Insert should not throw', async () => {
    await sensorRepo.storeEvent({
      sensorId: 1,
      readTimestamp: new Date().toISOString(),
      sensorValue: {
        temperature: 1,
        humidity: 1,
        lightIntensity: 1,
        earthMoisture: 1,
      },
    });

    const resp = await pgPool.query(
      'SELECT COUNT(*) as row_count FROM data_pipeline.sensor_read_event;'
    );
    expect(resp.rows[0]['row_count']).toEqual('405185');
  });
});
