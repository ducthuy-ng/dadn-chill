import { Pool } from 'pg';
import { PGRepository } from '.';
import { Sensor } from '../../core/domain/Sensor';
import { SensorIdNotFound } from '../../core/usecases/repos/SensorRepo';
import { BSLogger } from '../BSLogger';

describe('PGSensorRepo test', () => {
  let sensorRepo: PGRepository;
  const PgConnString = 'postgresql://backend:password@localhost:5432/backend';

  const dummyLogger = new BSLogger('test logger', { target: '' });
  beforeAll(async () => {
    sensorRepo = new PGRepository(
      { host: 'localhost', user: 'backend', password: 'password', database: 'backend' },
      dummyLogger
    );
  });

  afterAll(async () => {
    await sensorRepo.disconnect();
    const pool = new Pool({ connectionString: PgConnString });
    await pool.query("SELECT setval('id_sequence', 7, false)");
    await pool.end();
  });

  test('Get existing sensor by ID', async () => {
    const sensor = await sensorRepo.getById(1);
    expect(sensor).not.toBeNull();
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
    const retrievedSensor = await sensorRepo.getById(7);
    expect(retrievedSensor).not.toBeNull();

    await sensorRepo.deleteById(7);

    try {
      await sensorRepo.getById(7);
    } catch (exception) {
      expect(exception).toBeInstanceOf(SensorIdNotFound);
    }
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

    const retrievedSensor = await sensorRepo.getById(7);
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
  });

  test('Get all sensors', async () => {
    const sensorList = await sensorRepo.getAllSensors(0, 6);
    expect(sensorList).toHaveLength(6);
  });

  test('Get all with offset 2, limit 2 should be different from offset 0, limit 2', async () => {
    const sensorList1 = await sensorRepo.getAllSensors(0, 2);
    const sensorList2 = await sensorRepo.getAllSensors(2, 2);

    sensorList1.forEach((sensor1) => expect(sensorList2).not.toContainEqual(sensor1));
  });

  test('Get all sensor IDs', async () => {
    const sensorIds = await sensorRepo.getAllSensorIds();
    expect(sensorIds.length).not.toEqual(0);
  });
});
