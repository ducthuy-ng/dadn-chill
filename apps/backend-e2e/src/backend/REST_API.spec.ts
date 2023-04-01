import axios from 'axios';

describe('Testing REST API, route /sensors', () => {
  test('Simple get all sensors should return 6 sensors', async () => {
    const resp = await axios.get('http://localhost:3333/sensors');
    expect(resp.data).toBeInstanceOf(Array);
    expect(resp.data).toHaveLength(6);
  });

  test('Simple get all sensors, offset=2 should return 4 sensors', async () => {
    const resp = await axios.get('http://localhost:3333/sensors?offset=2');
    expect(resp.data).toBeInstanceOf(Array);
    expect(resp.data).toHaveLength(4);
  });

  test('Simple get all sensors, limit=10 should return 6 sensors', async () => {
    const resp = await axios.get('http://localhost:3333/sensors?limit=10');
    expect(resp.data).toBeInstanceOf(Array);
    expect(resp.data).toHaveLength(6);
  });
});
