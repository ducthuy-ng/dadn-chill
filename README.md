# DadnChill

<a alt="Nx logo" href="https://nx.dev" target="_blank" rel="noreferrer"><img src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-logo.png" width="45"></a>

✨ **This workspace has been generated by [Nx, a Smart, fast and extensible build system.](https://nx.dev)** ✨

## MQTT topic

MQTT will use the predefined topic: `chill-topic`
Message should be a JSON formatted:

```json
{
  "sensorId": 1,
  "timestamp": "2023-03-18T08:44:49.832Z",
  "temperature": 1,
  "humidity": 1,
  "earthMoisture": 1,
  "GDD": 1
}
```

## Understand this workspace

Run `nx graph` to see a diagram of the dependencies of the projects.

## Remote caching

Run `npx nx connect-to-nx-cloud` to enable [remote caching](https://nx.app) and make CI faster.

## Further help

Visit the [Nx Documentation](https://nx.dev) to learn more.
