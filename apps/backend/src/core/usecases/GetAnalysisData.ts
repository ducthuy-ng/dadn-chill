import {
  AnalysisTool,
  EarthMoistureHistoryItem,
  HumidityHistoryItem,
  LightIntensityHistoryItem,
  TemperatureHistoryItem,
} from './gateways/AnalysisTool';

type AnalysisResult = {
  temperatureData: TemperatureHistoryItem[];
  humidityData: HumidityHistoryItem[];
  lightIntensityData: LightIntensityHistoryItem[];
  earthMoistureData: EarthMoistureHistoryItem[];
};

class GetAnalysisDataUseCase {
  private analysisTool: AnalysisTool;

  constructor(analysisTool: AnalysisTool) {
    this.analysisTool = analysisTool;
  }

  execute(sensorId: number): AnalysisResult {
    return {
      temperatureData: this.analysisTool.getTemperatureLastWeekByDayScaleOfSensor(sensorId),
      humidityData: this.analysisTool.getHumidityLastWeekByDayScaleOfSensor(sensorId),
      lightIntensityData: this.analysisTool.getLightIntensityLastWeekByDayScaleOfSensor(sensorId),
      earthMoistureData: this.analysisTool.getEarthMoistureLastWeekByDayScaleOfSensor(sensorId),
    };
  }
}

export { AnalysisResult, GetAnalysisDataUseCase };
