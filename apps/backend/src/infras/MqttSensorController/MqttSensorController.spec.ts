import * as mqtt from 'async-mqtt';
import { MqttSensorController } from '.';
import { Sensor } from '../../core/domain/Sensor';
import { SensorCommand } from '../../core/domain/SensorCommand';
import { SensorIdNotConnect } from '../../core/usecases/gateways/SensorController';
import { LogLevel } from '../../core/usecases/Logger';
import { BSLogger } from '../BSLogger';
import { InMemSensorRepo } from '../InMemSensorRepo';
import { sleep } from '../testingTools';

describe('Unit test for MQTT Sensor Controller', () => {
  const mqttEndPoint = 'mqtt://localhost:1883';

  const sensor1 = new Sensor(1, 'sensor1');

  const command1: SensorCommand = {
    sensorId: 1,
    details: 0,
  };

  const command2: SensorCommand = {
    sensorId: 2,
    details: 1,
  };

  test('if SensorRepo have 1 sensor, then it should load correctly', async () => {
    const mqttClient = await mqtt.connectAsync(mqttEndPoint);
    mqttClient.subscribe('controller/sensor-1');

    let receivedMessage = false;

    mqttClient.on('message', (_topic, payload) => {
      expect(payload.toString()).toEqual(command1.details.toString());
      receivedMessage = true;
    });

    const sensorRepo = new InMemSensorRepo();
    sensorRepo.saveSensor(sensor1);

    const controller = new MqttSensorController(
      mqttEndPoint,
      new BSLogger('test-controller', { level: LogLevel.DEBUG })
    );
    controller.populateSensors(sensorRepo);
    await controller.startServer();

    expect(controller.forwardCommand(command1)).resolves.not.toThrow();
    await new Promise(process.nextTick);

    await sleep(1);
    await mqttClient.end();
    await controller.stopServer();

    if (!receivedMessage) throw new Error();
  });

  test('if SensorRepo have unmatched sensor, then forward command should fail', async () => {
    const mqttClient = mqtt.connect(mqttEndPoint);
    mqttClient.on('message', () => fail());

    const sensorRepo = new InMemSensorRepo();
    sensorRepo.saveSensor(sensor1);

    const controller = new MqttSensorController(
      mqttEndPoint,
      new BSLogger('test-controller', { level: LogLevel.DEBUG })
    );
    controller.populateSensors(sensorRepo);
    await controller.startServer();

    try {
      await controller.forwardCommand(command2);
      throw new Error('forward command not throw');
    } catch (err) {
      expect(err).toBeInstanceOf(SensorIdNotConnect);
    }

    await new Promise(process.nextTick);

    await sleep(1);
    await mqttClient.end();
    await controller.stopServer();
  });

  test('later sensor subscriber should still work', async () => {
    let haveReceivedMsg = false;

    const mqttClient = mqtt.connect(mqttEndPoint);
    mqttClient.subscribe('controller/sensor-1');
    mqttClient.on('message', (_topic, payload) => {
      expect(payload.toString()).toEqual(command1.details.toString());
      haveReceivedMsg = true;
    });

    const controller = new MqttSensorController(
      mqttEndPoint,
      new BSLogger('test-controller', { level: LogLevel.DEBUG })
    );
    await controller.startServer();
    await sleep(1);

    controller.prepareConnectionForSensor(sensor1.getId());
    expect(controller.forwardCommand(command1)).resolves.not.toThrow();
    await new Promise(process.nextTick);

    await sleep(1);
    await mqttClient.end();
    await controller.stopServer();

    if (!haveReceivedMsg) throw new Error();
  });
});
