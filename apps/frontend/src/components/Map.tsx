import {
  Circle,
  LayerGroup,
  MapContainer,
  TileLayer,
  Tooltip,
  useMap
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useCallback, useEffect, useState } from 'react';
import { LatLngExpression, Map } from 'leaflet';

// metadata
const TILE_LAYER_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
const TILE_LAYER_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

interface DeviceLocation {
  id: string;
  connected: boolean;
  location: LatLngExpression;
}
interface MapProps {
  setSelectedId: React.Dispatch<any>;
  setMap: React.Dispatch<any>;
  selectedId: string;
  className: string;
  data: DeviceLocation[];
}

export const convertDevice = (object: any): DeviceLocation => {
  return {
    id: object.id,
    connected: object.connected,
    location: object.location,
  };
};




export default function MapEngine(props: MapProps) {
  // mapdata
  const position = { lat: 10.5082062, lng: 106.8602405 };
  const style = { width: '100%' };
  const zoom = 13;

  const data = props.data;

  return (
    
    <MapContainer center={position} zoom={zoom} ref={props.setMap} className={props.className}>
      <TileLayer attribution={TILE_LAYER_ATTRIBUTION} url={TILE_LAYER_URL} />


      {data.map((item) => (
        <Circle
          key={item.id}
          center={item.location}
          color={item.connected ? 'green' : 'red'}
          fillColor={item.connected ? 'green' : 'red'}
          radius={200}
        >
          <Tooltip direction="top" offset={[0, -10]} opacity={1}>
            <p>{item.id}</p>
            <p>{item.location.toString()}</p>
          </Tooltip>
        </Circle>
      ))}
    </MapContainer>
  );
}
