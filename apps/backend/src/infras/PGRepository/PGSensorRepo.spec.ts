import { Pool } from 'pg';
import { PGRepository } from '.';
import { Sensor } from '../../core/domain/Sensor';

describe('PGSensorRepo test', () => {
  let sensorRepo: PGRepository;
  const PgConnString = 'postgresql://backend:password@localhost:5432/backend';

  beforeAll(async () => {
    sensorRepo = new PGRepository(PgConnString, false);
  });

  afterAll(async () => {
    await sensorRepo.disconnect();
    const pool = new Pool({ connectionString: PgConnString });
    await pool.query("SELECT setval('id_sequence', 7, false)");
    await pool.end();
  });

  test('Get existing sensor by ID', async () => {
    const sensor = await sensorRepo.getById(1);
    expect(sensor).not.toBeNull;
  });

  test.skip('Get next with default data should return 7', async () => {
    const nextId = await sensorRepo.getNextId();
    expect(nextId).toEqual(7);
  });

  test('Insert and delete should success', async () => {
    const sensor = new Sensor(7, 'sensor test');
    sensor.moveSensorToNewLocation({
      longitude: 1,
      latitude: 1,
    });
    sensor.processReadEvent({
      sensorId: 7,
      readTimestamp: new Date().toISOString(),
      sensorValue: {
        temperature: 1,
        humidity: 1,
        lightIntensity: 1,
        earthMoisture: 1,
      },
    });

    await sensorRepo.saveSensor(sensor);
    let retrievedSensor = await sensorRepo.getById(7);
    expect(retrievedSensor).not.toBeNull();

    await sensorRepo.deleteById(7);
    retrievedSensor = await sensorRepo.getById(7);
    expect(retrievedSensor).toBeNull();
  });

  test('Insert then update should success', async () => {
    const sensor = new Sensor(7, 'sensor test');
    sensor.moveSensorToNewLocation({
      longitude: 1,
      latitude: 1,
    });
    sensor.processReadEvent({
      sensorId: 7,
      readTimestamp: new Date().toISOString(),
      sensorValue: {
        temperature: 1,
        humidity: 1,
        lightIntensity: 1,
        earthMoisture: 1,
      },
    });
    await sensorRepo.saveSensor(sensor);

    let retrievedSensor = await sensorRepo.getById(7);
    retrievedSensor.processReadEvent({
      sensorId: 7,
      readTimestamp: new Date().toISOString(),
      sensorValue: {
        temperature: 2,
        humidity: 2,
        lightIntensity: 2,
        earthMoisture: 2,
      },
    });

    sensorRepo.saveSensor(retrievedSensor);
    sensorRepo.getById(7);

    const updatedSensor = await sensorRepo.getById(7);
    expect(updatedSensor).not.toBeNull();
    expect(updatedSensor.getReadValue()).toEqual({
      temperature: 2,
      humidity: 2,
      lightIntensity: 2,
      earthMoisture: 2,
    });

    await sensorRepo.deleteById(7);
    retrievedSensor = await sensorRepo.getById(7);
    expect(retrievedSensor).toBeNull();
  });
});
