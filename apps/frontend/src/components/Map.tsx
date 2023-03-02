import {
  Circle,
  MapContainer,
  TileLayer,
  Tooltip
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  data: DeviceLocation[];
}

interface DisplayPositionProps {
  map: Map
}


export const convertDevice = (object: any): DeviceLocation => {
  return {
    id: object.id,
    connected: object.connected,
    location: object.location,
  };
};

export function DisplayPosition({map} : DisplayPositionProps) {
  const center = map.getCenter()
  const zoom = map.getZoom()
  const [position, setPosition] = useState(() => map.getCenter())

  const onClick = useCallback(() => {
    map.setView(center, zoom)
  }, [map])

  const onMove = useCallback(() => {
    setPosition(map.getCenter())
  }, [map])

  useEffect(() => {
    map.on('move', onMove)
    return () => {
      map.off('move', onMove)
    }
  }, [map, onMove])

  return (
    <span className='float-left'>
      latitude: {position.lat.toFixed(4)}, longitude: {position.lng.toFixed(4)}{' '}
      <button onClick={onClick}>reset</button>
    </span>
  )
}


export default function MapEngine(props: MapProps) {
  // mapdata
  const position = { lat: 10.5082062, lng: 106.8602405 };
  const style = { height: '100%', width: '100%' };
  const zoom = 13;

  const data = props.data;

  return (
    
    <MapContainer center={position} zoom={zoom} style={style} ref={props.setMap}>
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
