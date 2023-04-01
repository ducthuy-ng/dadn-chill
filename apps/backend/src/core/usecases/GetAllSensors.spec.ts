import { InMemSensorRepo } from '../../infras/InMemSensorRepo';
import { Sensor } from '../domain/Sensor';
import { GetAllSensorUseCase } from './GetAllSensors';

const sensor1 = new Sensor(1, 'sensor1');
const sensor2 = new Sensor(2, 'sensor2');

describe('GetAllSensors use case unit tests', () => {
  test('Execute use case should return 2 values', async () => {
    const sensorRepo = new InMemSensorRepo();
    const getSensorListUseCase = new GetAllSensorUseCase(sensorRepo);

    sensorRepo.saveSensor(sensor1);
    sensorRepo.saveSensor(sensor2);
    const [sensorList, numOfSensor] = await getSensorListUseCase.execute(0, 2);

    expect(numOfSensor).toEqual(2);
    expect(sensorList).toContainEqual(sensor1);
    expect(sensorList).toContainEqual(sensor2);
  });

  test('Execute use case with negative offset should move offset to 0', async () => {
    const sensorRepo = new InMemSensorRepo();
    const getSensorListUseCase = new GetAllSensorUseCase(sensorRepo);

    sensorRepo.saveSensor(sensor1);
    const [sensorList] = await getSensorListUseCase.execute(-1, 1);

    expect(sensorList.length).toEqual(1);
    expect(sensorList).toContainEqual(sensor1);
  });

  test('Execute use case with negative limit should return empty array', async () => {
    const sensorRepo = new InMemSensorRepo();
    const getSensorListUseCase = new GetAllSensorUseCase(sensorRepo);

    sensorRepo.saveSensor(sensor1);
    const [sensorList] = await getSensorListUseCase.execute(0, -12);

    expect(sensorList.length).toEqual(0);
  });

  test('Execute use case with over offset should return empty array', async () => {
    const sensorRepo = new InMemSensorRepo();
    const getSensorListUseCase = new GetAllSensorUseCase(sensorRepo);

    sensorRepo.saveSensor(sensor1);
    const [sensorList] = await getSensorListUseCase.execute(1, 1);

    expect(sensorList.length).toEqual(0);
  });

  test('Execute use case with over limit should move item', async () => {
    const sensorRepo = new InMemSensorRepo();
    const getSensorListUseCase = new GetAllSensorUseCase(sensorRepo);

    sensorRepo.saveSensor(sensor1);
    const [sensorList] = await getSensorListUseCase.execute(0, 2);

    expect(sensorList.length).toEqual(1);
    expect(sensorList).toContainEqual(sensor1);
  });

  test('Execute use case limit=10, numOfSensors=6 should return 6, not 4', async () => {
    const sensorRepo = new InMemSensorRepo();
    const getSensorListUseCase = new GetAllSensorUseCase(sensorRepo);

    for (let i = 0; i <= 5; ++i) sensorRepo.saveSensor(new Sensor(i, `dummy-sensor-${i}`));
    const [sensorList] = await getSensorListUseCase.execute(0, 10);

    expect(sensorList.length).toEqual(6);
    sensorList.forEach((sensor, index) =>
      expect(sensor.getName()).toEqual(`dummy-sensor-${index}`)
    );
  });
});
