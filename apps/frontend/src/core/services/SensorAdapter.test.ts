import { SensorData } from '../domain/Sensor';
import { fetchPagedSensors, fetchSingleSensor } from './SensorAdapter';

describe('Test fetch sensors', () => {
  const testSensors: SensorData[] = [
    {
      id: 'sensor-001',
      name: 'Cảm biến 1',
      connected: true,
      temperature: 1,
      humidity: 1,
      lux: 1,
      moist: 1,
      time: '2023-03-18T11:09:53.528Z',
      location: [10.552493, 106.873474],
    },
    {
      id: 'sensor-002',
      name: 'Cảm biến 2',
      connected: false,
      temperature: 1,
      humidity: 1,
      lux: 1,
      moist: 1,
      time: '2023-03-18T11:09:53.528Z',
      location: [10.5390624, 106.879069],
    },
    {
      id: 'sensor-003',
      name: 'Cảm biến 3',
      connected: false,
      temperature: 1,
      humidity: 1,
      lux: 1,
      moist: 1,
      time: '2023-03-18T11:09:53.528Z',
      location: [10.5257651, 106.8480182],
    },
    {
      id: 'sensor-004',
      name: 'Cảm biến 4',
      connected: true,
      temperature: 1,
      humidity: 1,
      lux: 1,
      moist: 1,
      time: '2023-03-18T11:09:53.528Z',
      location: [10.5122799, 106.7979179],
    },
    {
      id: 'sensor-006',
      name: 'Cảm biến 5',
      connected: true,
      temperature: 1,
      humidity: 1,
      lux: 1,
      moist: 1,
      time: '2023-03-18T11:09:53.528Z',
      location: [10.478189, 106.839396],
    },
    {
      id: 'sensor-007',
      name: 'Cảm biến 6',
      connected: false,
      temperature: 2,
      humidity: 3,
      lux: 1,
      moist: 0,
      time: '2023-03-18T11:09:53.528Z',
      location: [10.4792, 106.8984],
    },
  ];
  let baseURL: string;
  beforeEach(() => {
    baseURL = 'https://my-json-server.typicode.com/TuanKietTran/mock_sensor';
  });

  it('should fetch sensors sucessfully', async () => {
    const status = (await fetchPagedSensors(1, baseURL)).status;

    expect(status).toStrictEqual(200);
  });

  it('should fetch sensors correctly', async () => {
    const response = await (await fetchPagedSensors(1, baseURL)).data;
    expect(response).toStrictEqual(testSensors);
  });

  it.each(testSensors)('should fetch sensors correctly', async (sensor) => {
    const response = await (await fetchSingleSensor(sensor.id, baseURL)).data;
    expect(response).toStrictEqual(sensor);
  });

  it('should reject when fetching a wrong-id sensor', async () => {
    await expect(fetchSingleSensor('sensor-009', baseURL)).rejects.toEqual(404);
  });
});
