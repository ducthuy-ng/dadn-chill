import { LatLngExpression } from 'leaflet';

export type SensorMetadata = {
  id: string;
  name: string;
  connected: boolean;
  location: LatLngExpression;
};

export type SensorTimeSeriesData = {
  id: string;
  time: string;
  temperature: number;
  humidity: number;
  lux: number;
  moist: number;
};

export type SensorData = SensorMetadata & SensorTimeSeriesData;
