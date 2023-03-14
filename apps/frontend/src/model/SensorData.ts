import { LatLngExpression } from 'leaflet';

export type MapData = {
  id: number;
  connected: boolean;
  location: LatLngExpression;
};

export type SensorData = {
  id: number;
  name: string;
  connected: boolean;
  temperature: number;
  humidity: number;
  lux: number;
  windSpeed: number;

  location: LatLngExpression;
};
