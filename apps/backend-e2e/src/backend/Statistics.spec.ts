import axios from 'axios';

describe('Test REST API, /statistics route', () => {
  test('It should successfully fetch /statistics', async () => {
    const resp = await axios.post(
      'http://localhost:3333/statistics',
      {
        startDate: '2023-03-09',
        endDate: '2023-03-11',
      },
      { validateStatus: () => true }
    );

    expect(resp.status).toEqual(200);

    expect(resp.data['temperatureHistory']).toContainEqual({
      temperature: expect.closeTo(22.274592774582015),
      day: '2023-03-09',
    });

    expect(resp.data['temperatureHistory']).toContainEqual({
      temperature: expect.closeTo(21.981636499812762),
      day: '2023-03-10',
    });

    expect(resp.data['temperatureHistory']).toContainEqual({
      temperature: expect.closeTo(22.309406762269397),
      day: '2023-03-11',
    });
  });
});
