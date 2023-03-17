import { SensorReadEvent } from "../../domain/SensorReadEvent";

abstract class EventMQ {
  abstract onNewEvent(callback: (event: SensorReadEvent) => unknown): void;
}

export { EventMQ };
