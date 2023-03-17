/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { exit } from 'process';
import { ExpressServer } from './infras/ExpressServer';
import { KafkaEventMQ } from './infras/KafkaEventMQ';

if (process.env.KAFKA_BROKERS === null) {
  console.error(`"KAFKA_BROKERS" is not defined`);
  exit(1);
}
const kafkaBrokers = process.env.KAFKA_BROKERS.split(',');
const eventMQ = new KafkaEventMQ(kafkaBrokers, 'test-topic');

eventMQ.onNewEvent((event) => {
  console.log(event);
});

eventMQ.startListening();

async function closingServer() {
  await eventMQ.stopListening();
}

process.once('SIGINT', closingServer);
