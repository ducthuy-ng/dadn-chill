import * as mqtt from 'async-mqtt';
import axios from 'axios';
import EventSource from 'eventsource';

jest.setTimeout(10000);

describe('Test full Backend pipeline', () => {
  const event1 = {
    sensorId: 1,
    readTimestamp: new Date().toISOString(),
    sensorValue: {
      temperature: 1,
      humidity: 1,
      lightIntensity: 1,
      earthMoisture: 1,
    },
  };
  test.skip('Test full Backend pipeline', async () => {
    const res = await axios.get(`/streaming/subscribe`);
    const clientId = res.data;
    expect(clientId).not.toBeNull();

    const subscriptionRes = await axios.post('/streaming/changeSubscription', {
      clientId: clientId,
      sensorIds: [1],
    });
    expect(subscriptionRes.status).toEqual(200);

    const mqttClient = mqtt.connect('mqtt://localhost:1883');
    await sleep(2);

    mqttClient.publish('chill-topic', JSON.stringify(event1));
    await sleep(2);

    const fetchUpdates = await axios.get(`/streaming/events/${clientId}`);

    expect(fetchUpdates.status).toEqual(200);
    expect(fetchUpdates.data).toContainEqual(event1);
  });

  test('Test full Backend pipeline with SSE', async () => {
    const res = await axios.get(`/streaming/subscribe`);
    const clientId = res.data;
    expect(clientId).not.toBeNull();

    const receivedEvents = [];
    const eventSource = new EventSource(`http://localhost:3333/streaming/${clientId}`);
    eventSource.addEventListener('sensorEvent', (event) => {
      const sensorEvent = JSON.parse(event.data);
      receivedEvents.push(sensorEvent);
      eventSource.close();
    });

    const subscriptionRes = await axios.post('/streaming/changeSubscription', {
      clientId: clientId,
      sensorIds: [1],
    });
    expect(subscriptionRes.status).toEqual(200);

    const mqttClient = mqtt.connect('mqtt://localhost:1883');
    await sleep(2);

    mqttClient.publish('chill-topic', JSON.stringify(event1));
    await sleep(2);

    expect(receivedEvents).toContainEqual(event1);
  });
});

export async function sleep(seconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}
