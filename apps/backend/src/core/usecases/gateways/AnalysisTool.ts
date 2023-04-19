import { SensorId } from '../../domain/Sensor';
import { AnalysisResult } from '../GetTotalAnalysisData';

interface AnalysisTool {
  getAnalysisResultOfSensor(
    id: SensorId,
    startDate: string,
    endDate: string
  ): Promise<AnalysisResult>;

  getTotalAnalysisResult(startDate: string, endDate: string): Promise<AnalysisResult>;
}

export { AnalysisTool };
