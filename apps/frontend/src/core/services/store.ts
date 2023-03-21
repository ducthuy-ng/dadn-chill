import { atom } from 'jotai';
import { loadable } from 'jotai/utils';
import { SensorData } from '../domain/Sensor';
import { fetchPagedSensors } from './SensorAdapter';

export const sidebar = atom<boolean>(false);
export const sensors = atom<SensorData[]>([]);
export const getSensors = atom(
  async (get) => get(sensors),
  async (get, set, page: number) => {
    const response = await fetchPagedSensors(page);
    const data = await response.data;
    set(sensors, data);
  }
);
export const loadableSensor = loadable(getSensors);
