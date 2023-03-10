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

type WindSpeedHistoryItem = {
  windSpeed: number;
  recordedTimeStamp: string;
};

interface AnalysisTool {
  getTemperatureLastWeekByDayScaleOfSensor(sensorId: number): TemperatureHistoryItem[];
  getHumidityLastWeekByDayScaleOfSensor(sensorId: number): HumidityHistoryItem[];
  getLightIntensityLastWeekByDayScaleOfSensor(sensorId: number): LightIntensityHistoryItem[];
  getWindSpeedLastWeekByDayScaleOfSensor(sensorId: number): WindSpeedHistoryItem[];
}

export {
  TemperatureHistoryItem,
  HumidityHistoryItem,
  LightIntensityHistoryItem,
  WindSpeedHistoryItem,
  AnalysisTool,
};
