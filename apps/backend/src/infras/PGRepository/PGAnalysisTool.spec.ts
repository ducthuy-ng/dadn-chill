import { PGRepository } from '.';
import { LogLevel } from '../../core/usecases/Logger';
import { BSLogger } from '../BSLogger';

const pgRepo = new PGRepository(
  {
    host: 'localhost',
    port: 5432,
    user: 'backend',
    password: 'password',
    database: 'backend',
  },
  new BSLogger('test-PGAnalysisTool', { level: LogLevel.DEBUG })
);

afterAll(async () => {
  await pgRepo.disconnect();
});

describe('Test PGAnalysisTool - getAnalysisResultOfSensor', () => {
  it('should return answer if valid range and sensor ID', async () => {
    const result = await pgRepo.getAnalysisResultOfSensor(1, '2023-03-10', '2023-03-14');

    expect(result).toHaveProperty('temperatureData');
    expect(result).toHaveProperty('humidityData');
    expect(result).toHaveProperty('lightIntensityData');
    expect(result).toHaveProperty('earthMoistureData');
  });

  it('should return correct answer for the first selected date', async () => {
    const result = await pgRepo.getAnalysisResultOfSensor(1, '2023-03-10', '2023-03-14');

    expect(result.temperatureData[0].calculatedDate).toEqual('2023-03-10T00:00:00.000Z');
    expect(result.temperatureData[0].averageValue).toEqual(21.999607);

    expect(result.humidityData[0].calculatedDate).toEqual('2023-03-10T00:00:00.000Z');
    expect(result.humidityData[0].averageValue).toEqual(50.64531);

    expect(result.lightIntensityData[0].calculatedDate).toEqual('2023-03-10T00:00:00.000Z');
    expect(result.lightIntensityData[0].averageValue).toEqual(0.033216633);

    expect(result.earthMoistureData[0].calculatedDate).toEqual('2023-03-10T00:00:00.000Z');
    expect(result.earthMoistureData[0].averageValue).toEqual(0);
  });

  it('should return an object with empty array if invalid args', async () => {
    const result = await pgRepo.getAnalysisResultOfSensor(1, '2023-03-27', '2023-03-30');

    expect(result).toHaveProperty('temperatureData', []);
    expect(result).toHaveProperty('humidityData', []);
    expect(result).toHaveProperty('lightIntensityData', []);
    expect(result).toHaveProperty('earthMoistureData', []);
  });
});

describe('Test PGAnalysisTool - getTotalAnalysisResult', () => {
  it('should return answer if valid range and sensor ID', async () => {
    const result = await pgRepo.getTotalAnalysisResult('2023-03-10', '2023-03-14');

    expect(result).toHaveProperty('temperatureData');
    expect(result).toHaveProperty('humidityData');
    expect(result).toHaveProperty('lightIntensityData');
    expect(result).toHaveProperty('earthMoistureData');
  });

  it('should return correct answer for the first selected date', async () => {
    const result = await pgRepo.getTotalAnalysisResult('2023-03-10', '2023-03-14');

    expect(result.temperatureData[0].calculatedDate).toEqual('2023-03-10T00:00:00.000Z');
    expect(result.temperatureData[0].averageValue).toEqual(21.981636);

    expect(result.humidityData[0].calculatedDate).toEqual('2023-03-10T00:00:00.000Z');
    expect(result.humidityData[0].averageValue).toEqual(59.88239);

    expect(result.lightIntensityData[0].calculatedDate).toEqual('2023-03-10T00:00:00.000Z');
    expect(result.lightIntensityData[0].averageValue).toEqual(0.27407673);

    expect(result.earthMoistureData[0].calculatedDate).toEqual('2023-03-10T00:00:00.000Z');
    expect(result.earthMoistureData[0].averageValue).toEqual(0);
  });
});
