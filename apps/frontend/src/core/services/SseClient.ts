export default class SSE {
  public eventSource: EventSource;

  public constructor(clientId: string) {
    this.eventSource = new EventSource(`${import.meta.env.VITE_HOST}/streaming/${clientId}`);
  }
}
