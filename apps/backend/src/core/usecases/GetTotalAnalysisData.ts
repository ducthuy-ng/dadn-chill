import { DomainRegistry } from '../../infras/DomainRegistry';

export type AnalysisResult = {
  temperatureData: TemperatureHistoryItem[];
  humidityData: HumidityHistoryItem[];
  lightIntensityData: LightIntensityHistoryItem[];
  earthMoistureData: EarthMoistureHistoryItem[];
};

export type TemperatureHistoryItem = {
  calculatedDate: string;
  averageValue: number;
};

export type HumidityHistoryItem = {
  calculatedDate: string;
  averageValue: number;
};

export type LightIntensityHistoryItem = {
  calculatedDate: string;
  averageValue: number;
};

export type EarthMoistureHistoryItem = {
  calculatedDate: string;
  averageValue: number;
};

export class InvalidSensorId implements Error {
  name = 'InvalidSensorId';
  message: string;

  constructor(sensorId: number) {
    this.message = `SensorID does not exist: ${sensorId}`;
  }
}

export class GetTotalAnalysisDataUseCase {
  public domainRegistry: DomainRegistry;

  constructor(domainRegistry: DomainRegistry) {
    this.domainRegistry = domainRegistry;
  }

  async execute(startDate: string, endDate: string): Promise<AnalysisResult> {
    const analysisTool = this.domainRegistry.analysisTool;
    return analysisTool.getTotalAnalysisResult(startDate, endDate);
  }
}
