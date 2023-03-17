type TemperatureHistoryItem = {
  temperature: number;
  recordedTimeStamp: string;
};

type HumidityHistoryItem = {
  humidity: number;
  recordedTimeStamp: string;
};

type LightIntensityHistoryItem = {
  lightIntensity: number;
  recordedTimeStamp: string;
};

type EarthMoistureHistoryItem = {
  EarthMoisture: number;
  recordedTimeStamp: string;
};

interface AnalysisTool {
  getTemperatureLastWeekByDayScaleOfSensor(sensorId: number): TemperatureHistoryItem[];
  getHumidityLastWeekByDayScaleOfSensor(sensorId: number): HumidityHistoryItem[];
  getLightIntensityLastWeekByDayScaleOfSensor(sensorId: number): LightIntensityHistoryItem[];
  getEarthMoistureLastWeekByDayScaleOfSensor(sensorId: number): EarthMoistureHistoryItem[];
}

export {
  TemperatureHistoryItem,
  HumidityHistoryItem,
  LightIntensityHistoryItem,
  EarthMoistureHistoryItem,
  AnalysisTool,
};
