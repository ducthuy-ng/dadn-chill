import { Sensor } from '../../core/domain/Sensor';

export type SensorDto = {
  id: number;
  name: string;
  lastUpdateTimestamp: string;
  temperature: number;
  humidity: number;
  lux: number;
  moist: number;
  location: number[];
};

export function GenerateDto(sensor: Sensor): SensorDto {
  const sensorLastReadValue = sensor.getReadValue();
  const sensorLocation = sensor.getSetupLocation();

  return {
    id: sensor.getId(),
    name: sensor.getName(),
    lastUpdateTimestamp: sensor.getLastReadTimestamp(),
    temperature: sensorLastReadValue.temperature,
    humidity: sensorLastReadValue.humidity,
    lux: sensorLastReadValue.lightIntensity,
    moist: sensorLastReadValue.earthMoisture,
    location: [sensorLocation.longitude, sensorLocation.latitude],
  };
}
