import { http } from "./httpClient";
import { SensorData } from "../domain/Sensor";
import { AxiosResponse } from "axios";

export const fetchPagedSensors = async (page: number): Promise<AxiosResponse> => {
  return await http.get<SensorData[]>("/sensors", {params: {page: page}});
};

export const fetchSingleSensor = async (id: string): Promise<AxiosResponse> => {
  return await http.get<SensorData>("/sensor", {params: {id: id}});
};