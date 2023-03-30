import { Sensor } from '../../core/domain/Sensor';
import { BSLogger } from '../BSLogger';
import { MqttSensorController } from '.';
import { InMemSensorRepo } from '../InMemSensorRepo';
import * as mqtt from 'async-mqtt';
import { SensorCommand } from '../../core/domain/SensorCommand';
import { sleep } from '../testingTools';
import { LogLevel } from '../../core/usecases/Logger';

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
    const mqttClient = mqtt.connect(mqttEndPoint);
    mqttClient.on('message', (_topic, payload) => {
      expect(payload.toString()).toEqual(command1.details.toString());
    });

    const sensorRepo = new InMemSensorRepo();
    sensorRepo.saveSensor(sensor1);

    const controller = new MqttSensorController(
      mqttEndPoint,
      new BSLogger('test-controller', { level: LogLevel.DEBUG })
    );
    controller.populateSensors(sensorRepo);
    await controller.startServer();

    const result = await controller.forwardCommand(command1);
    expect(result.success).toBeTruthy();
    await new Promise(process.nextTick);

    await sleep(1);
    await mqttClient.end();
    await controller.stopServer();
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

    const result = await controller.forwardCommand(command2);
    expect(result.success).toBeFalsy();
    await new Promise(process.nextTick);

    await sleep(1);
    await mqttClient.end();
    await controller.stopServer();
  });

  test('later sensor subscriber should still work', async () => {
    const mqttClient = mqtt.connect(mqttEndPoint);
    mqttClient.on('message', (_topic, payload) => {
      expect(payload.toString()).toEqual(command1.details.toString());
    });

    const controller = new MqttSensorController(
      mqttEndPoint,
      new BSLogger('test-controller', { level: LogLevel.DEBUG })
    );
    await controller.startServer();
    await sleep(1);

    controller.prepareConnectionForSensor(sensor1.getId());
    const result = await controller.forwardCommand(command1);
    expect(result.success).toBeTruthy();
    await new Promise(process.nextTick);

    await sleep(1);
    await mqttClient.end();
    await controller.stopServer();
  });
});
