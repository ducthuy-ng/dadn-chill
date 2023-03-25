import axios, { AxiosError } from "axios";
import express from "express";
import { Server } from "http";
import { SseClientManager } from ".";
import { LogLevel } from "../../core/usecases/Logger";
import { BSLogger } from "../BSLogger";
describe('Unit test for setTimeOut', () => {
  jest.useFakeTimers();

  const clientMgr = new SseClientManager({
    logger: new BSLogger('test-logger', { level: LogLevel.DEBUG }),
  });

  const app = express();
  app.use('/streaming', clientMgr.getListeningRoute());

  let server: Server;

  beforeAll((done) => {
    server = app.listen(3000, done);
  });

  afterAll((done) => {
    server.close(done);
  });

  test('After SECONDS_SINCE_LAST_CONNECTED, clientMap should clear it', (done) => {
    const clientId = clientMgr.generateNewClientId();
    clientMgr.openConnectionToClient(clientId);

    jest.advanceTimersByTime(SseClientManager.SECONDS_SINCE_LAST_CONNECTED * 1000 + 5);

    console.log('Timeout');

    axios
      .get(`http://localhost:3000/streaming/${clientId}`, {})
      .then((resp) => fail(resp.status))
      .catch((err: AxiosError) => {
        expect(err.response?.data['name']).toBe('ClientIdNotFound');
        done();
      });
  });
});
