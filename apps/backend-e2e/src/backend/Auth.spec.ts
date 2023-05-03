import axios from 'axios';

describe('Test authentication', () => {
  it('should return an API key if valid email and password', async () => {
    const resp = await axios.post(
      `/auth/login`,
      {
        email: 'nguyen.thuy@gmail.com',
        password: 'password',
      },
      {
        validateStatus: () => true,
      }
    );

    expect(resp.status).toEqual(200);
    expect(resp.headers).toHaveProperty('x-api-key');
  });
});
