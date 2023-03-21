// import EventSource from 'eventsource';

describe('Test SSEClientManager', () => {
  // let server: ExpressServer;
  //   beforeEach((done) => {
  //     server = new ExpressServer(3333);
  //     server.startListening(done);
  //   });
  //   afterEach((done) => {
  //     server.stopListening(done);
  //   });
  //   test.skip('Test start simple connection', async (done) => {
  //     const clientId = server.generateNewClientId();
  //     const eventSource = new EventSource(`http://localhost:3333/streaming/${clientId}`);
  //     eventSource.onmessage = (event) => {
  //       expect(event.data).not.toBeNull();
  //       eventSource.close();
  //       done();
  //     };
  //     await sleep(2);
  //     server.propagateSensorReadEvent({
  //       sensorId: 1,
  //       readTimestamp: new Date().toISOString(),
  //       sensorValue: {
  //         temperature: 1,
  //         humidity: 1,
  //         lightIntensity: 1,
  //         earthMoisture: 1,
  //       },
  //     });
  //   });
  test.skip('Test SSE server', () => {
    expect(true).toBeTruthy();
  });
});
