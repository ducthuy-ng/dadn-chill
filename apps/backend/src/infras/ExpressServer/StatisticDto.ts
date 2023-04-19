import { AnalysisResult } from '../../core/usecases/GetTotalAnalysisData';

export type StatisticDto = {
  temperatureHistory: { temperature: number; day: string }[];
  humidityHistory: { humidity: number; day: string }[];
  lightIntensityHistory: { lightIntensity: number; day: string }[];
  earthMoistureHistory: { earthMoisture: number; day: string }[];
};

export function mapAnalysisResultToDto(result: AnalysisResult): StatisticDto {
  return {
    temperatureHistory: result.temperatureData.map((record) => ({
      temperature: record.averageValue,
      day: record.calculatedDate.split('T')[0],
    })),
    humidityHistory: result.temperatureData.map((record) => ({
      humidity: record.averageValue,
      day: record.calculatedDate.split('T')[0],
    })),
    lightIntensityHistory: result.temperatureData.map((record) => ({
      lightIntensity: record.averageValue,
      day: record.calculatedDate.split('T')[0],
    })),
    earthMoistureHistory: result.temperatureData.map((record) => ({
      earthMoisture: record.averageValue,
      day: record.calculatedDate.split('T')[0],
    })),
  };
}
