/* eslint-disable */

import axios from 'axios';

module.exports = async function () {
  // Configure axios for tests to use.
  const host = process.env.HOST ?? 'localhost';
  const port = process.env.PORT ?? '3333';
  axios.defaults.baseURL = `http://${host}:${port}`;

  const authResp = await axios.post(`/auth/login`, {
    email: 'nguyen.thuy@gmail.com',
    password: 'password',
  });
  axios.defaults.headers.common['x-api-key'] = authResp.headers['x-api-key'];
};
