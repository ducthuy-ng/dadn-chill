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

export class GetAnalysisDataForSensorUseCase {
  public domainRegistry: DomainRegistry;

  constructor(domainRegistry: DomainRegistry) {
    this.domainRegistry = domainRegistry;
  }

  async execute(sensorId: number, startDate: string, endDate: string): Promise<AnalysisResult> {
    const sensorRepo = this.domainRegistry.sensorRepo;
    const selectedSensor = await sensorRepo.getById(sensorId);

    if (selectedSensor === null) {
      throw new InvalidSensorId(sensorId);
    }

    const analysisTool = this.domainRegistry.analysisTool;
    return analysisTool.getAnalysisResultOfSensor(sensorId, startDate, endDate);
  }
}
