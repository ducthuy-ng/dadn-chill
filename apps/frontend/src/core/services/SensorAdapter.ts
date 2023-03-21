import { http } from './httpClient';
import { SensorData } from '../domain/Sensor';
import { AxiosResponse } from 'axios';

export const fetchPagedSensors = async (page: number, baseURL?: string): Promise<AxiosResponse> => {
  return await http.get<SensorData[]>('/sensors', { params: { page: page }, baseURL: baseURL });
};

export const fetchSingleSensor = async (id: string, baseURL?: string): Promise<AxiosResponse> => {
  return await http.get<SensorData>(`/sensors/${id}`, { baseURL: baseURL });
};
