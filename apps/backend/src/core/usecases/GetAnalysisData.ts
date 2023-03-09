import {
  AnalysisTool,
  HumidityHistoryItem,
  LightIntensityHistoryItem,
  TemperatureHistoryItem,
  WindSpeedHistoryItem,
} from '../domain/analysis/analysisTool';

type AnalysisResult = {
  temperatureData: TemperatureHistoryItem[];
  humidityData: HumidityHistoryItem[];
  lightIntensityData: LightIntensityHistoryItem[];
  windSpeedData: WindSpeedHistoryItem[];
};

class GetAnalysisDataUseCase {
  private analysisTool: AnalysisTool;

  constructor(analysisTool: AnalysisTool) {
    this.analysisTool = analysisTool;
  }

  execute(sensorId: number): AnalysisResult {
    return {
      temperatureData:
        this.analysisTool.getTemperatureLastWeekByDayScaleOfSensor(sensorId),
      humidityData:
        this.analysisTool.getHumidityLastWeekByDayScaleOfSensor(sensorId),
      lightIntensityData:
        this.analysisTool.getLightIntensityLastWeekByDayScaleOfSensor(sensorId),
      windSpeedData:
        this.analysisTool.getWindSpeedLastWeekByDayScaleOfSensor(sensorId),
    };
  }
}

export { AnalysisResult, GetAnalysisDataUseCase };
