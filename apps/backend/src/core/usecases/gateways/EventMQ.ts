import { IProcessReadEventUC } from '../ProcessReadEvent';

abstract class EventMQ {
  abstract onNewEvent(usecase: IProcessReadEventUC): void;
}

export { EventMQ };
