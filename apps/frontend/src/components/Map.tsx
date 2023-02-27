import { Circle, MapContainer, Popup, TileLayer, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useMemo, useRef, useState } from 'react';

// metadata
const TILE_LAYER_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
const TILE_LAYER_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

interface DeviceLocation {
  id: string;
  connected: boolean;
  lat: number;
  lng: number;
}

export const convertDevice = (object: any): DeviceLocation => {
  return {id: object.id, connected: object.connected, lat: object.lat, lng: object.lng}
}

const sample: DeviceLocation[] = [
  // {
  //   id: 'sensor-001',
  //   connected: true,
  //   lat: 0,
  //   lng: 0
  // },
  {
    id: 'sensor-001',
    connected: false,
    lat: 10.552493,
    lng: 106.873474,
  },
  {
    id: 'sensor-002',
    connected: true,
    lat: 10.5390624,
    lng: 106.879069,
  },
  {
    id: 'sensor-003',
    connected: true,
    lat: 10.5257651,
    lng: 106.8480182,
  },
  {
    id: 'sensor-004',
    connected: true,
    lat: 10.5122799,
    lng: 106.7979179,
  },
  {
    id: 'sensor-005',
    connected: false,
    lat: 10.478189,
    lng: 106.839396,
  },
];


interface MapProps {
  setSelectedId: React.Dispatch<any>;
  selectedId: string;
  data: DeviceLocation[]
}

export default function Map(props : MapProps) {
  // mapdata
  const position = { lat: 10.5082062, lng: 106.8602405 };
  const style = { height: '100%', width: '100%' };
  const zoom = 13;

  const data = sample

  return (
    <MapContainer center={position} zoom={zoom} style={style}>
      <TileLayer attribution={TILE_LAYER_ATTRIBUTION} url={TILE_LAYER_URL} />

      {data.map((item) => (
        <Circle
          key={item.id}
          center={[item.lat, item.lng]}
          color={item.connected ? "green" : "red"}
          fillColor={item.connected ? "green" : "red"}
          radius={200}
          eventHandlers={{
            click: () => props.setSelectedId(item.id)
          }}
        > 
          <Tooltip direction="top" offset={[0,-10]} opacity={1}>
            <p>{item.id}</p>
            <p>
              {item.lat}, {item.lng}
            </p>
          </Tooltip>
        </Circle>
      ))}
    </MapContainer>
  );
}
