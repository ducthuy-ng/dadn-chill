import { LatLngExpression } from 'leaflet';

export type SensorMetadata = {
  id: number;
  name: string;
  connected: boolean;
  location: LatLngExpression;
};

export type SensorTimeSeriesData = {
  id: number;
  time: string;
  temperature: number;
  humidity: number;
  lux: number;
  moist: number;
};

export type SensorData = SensorMetadata & SensorTimeSeriesData;
