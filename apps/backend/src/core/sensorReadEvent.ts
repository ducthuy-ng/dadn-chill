export interface SensorReadEvent {
  sensorId: number;
  queueReceivedTimestamp: string;

  humidity: number;
  temperature: number;
}
