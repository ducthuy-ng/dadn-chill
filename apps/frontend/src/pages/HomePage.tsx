import { LatLngExpression, Map } from 'leaflet';
import { useCallback, useEffect, useState } from 'react';
import { FaCaretLeft, FaCaretRight, FaEye } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import MapEngine from '../components/Map';
import { SensorData } from '../core/domain/Sensor';
import { fetchPagedSensors } from '../core/services/SensorAdapter';


interface DisplayPositionProps {
  map: Map;
}

export function DisplayPosition({ map }: DisplayPositionProps) {
  const center = map.getCenter();
  const zoom = map.getZoom();
  const [position, setPosition] = useState(() => map.getCenter());

  const onClick = useCallback(() => {
    map.setView(center, zoom);
  }, [map, center, zoom]);

  const onMove = useCallback(() => {
    setPosition(map.getCenter());
  }, [map]);

  useEffect(() => {
    map.on('move', onMove);
    return () => {
      map.off('move', onMove);
    };
  }, [map, onMove]);

  return (
    <div
      className="absolute top-0 right-0 z-50 rounded-lg bg-blue-50 p-4 text-sm text-blue-800 dark:bg-gray-800 dark:text-blue-400"
      role="alert"
    >
      <span className="font-medium">
        latitude: {position.lat.toFixed(4)}, longitude: {position.lng.toFixed(4)}{' '}
      </span>
      <button onClick={onClick}>reset</button>
    </div>
  );
}

export default function HomePage() {
  const [sensorDummyData, getData] = useState<SensorData[]>([]);
  const [map, setMap] = useState<Map | null>(null);
  const zoom = 13;

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await fetchPagedSensors(1);
        const data = await response.data;
        getData(data);
      } catch (error) {
        console.log('An error occurred');
        clearInterval(interval);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleClickOnMap = (position: LatLngExpression): void => {
    if (map === null) return;
    map.setView(position, zoom);
    setMap(map);
  };

  return (
    <div className="flex-grow p-2">
      <div className="grid h-full grid-cols-5 gap-2">
        <div className="col-span-3 mx-1 flex flex-col">
          <h1 className="m-4 text-3xl font-bold">Cảm biến</h1>
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="border-b-2">
                <th className="py-2">Tên cảm biến</th>
                <th className="py-2">Online</th>
                <th className="py-2">Nhiệt độ</th>
                <th className="py-2">Độ ẩm</th>
                <th className="py-2">Ánh sáng</th>
                <th className="py-2">Độ ẩm đất</th>
                <th className="py-2">&nbsp;</th>
              </tr>
            </thead>
            <tbody>
              {sensorDummyData.length !== 0 ? (
                sensorDummyData.map((sensorData) => (
                  <tr
                    key={sensorData.id}
                    className="cursor-pointer border-b-2 hover:bg-gray-100"
                    onClick={() => handleClickOnMap(sensorData.location)}
                  >
                    <td className="py-2 text-center">{sensorData.name}</td>
                    <td className="py-2 text-center">
                      <span
                        className={`text- inline-block h-4  w-4 rounded-full  align-middle ${
                          sensorData.connected ? 'bg-green-500' : 'bg-red-500'
                        }`}
                      ></span>
                    </td>
                    <td className="py-2 text-center">{sensorData.temperature}</td>
                    <td className="py-2 text-center">{sensorData.humidity}</td>
                    <td className="py-2 text-center">{sensorData.lux}</td>
                    <td className="py-2 text-center">{sensorData.moist}</td>
                    <td className="py-2 text-center">
                      <Link to={`/sensor/${sensorData.id}`}>
                        <FaEye />
                      </Link>
                    </td>
                  </tr>
                ))
              ) : Array.from({length: 10}).map((value, id) => (
                <tr key={id} className="cursor-pointer border-b-2 hover:bg-gray-100">
                  <td className="py-2 text-center">
                    <div className="w-24 h-2.5 rounded-full bg-gray-300 inline-block align-middle"></div>
                  </td>
                  <td className="py-2 text-center">

                    <span
                      className={`text- inline-block h-4  w-4 rounded-full align-middle bg-gray-300`}
                    ></span>
                  </td>
                  <td className="py-2 text-center">
                    <div className="h-2.5 w-20 rounded-full bg-gray-300 inline-block align-middle"></div>
                  </td>
                  <td className="py-2 text-center">
                    <div className="h-2.5 w-20 rounded-full bg-gray-300 inline-block align-middle"></div>
                  </td>
                  <td className="py-2 text-center">
                    <div className="h-2.5 w-20 rounded-full bg-gray-300 inline-block align-middle"></div>
                  </td>
                  <td className="py-2 text-center">
                    <div className="h-2.5 w-20 rounded-full bg-gray-300 inline-block align-middle"></div>
                  </td>
                  <td className="py-2 text-center">
                  <div className="h-2.5 w-4 rounded-full bg-gray-300 inline-block align-middle"></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="my-4 flex w-full flex-row justify-end gap-10">
            <div className="flex flex-row gap-2">
              <span>Trang thứ</span>
              <span className="w-4 border-b-2 border-black text-center">2</span>
            </div>
            <div className="flex flex-row">
              <FaCaretLeft className="mx-2 h-full cursor-pointer" />
              <FaCaretRight className="mx-2 h-full cursor-pointer" />
            </div>
          </div>
        </div>
        <div className="relative col-span-2 mx-1 h-full rounded-md">
          <MapEngine
            className="z-0 h-full"
            setMap={setMap}
            data={sensorDummyData.map((el) => ({
              id: el.id,
              name: el.name,
              connected: el.connected,
              location: el.location,
            }))}
          />

          {map ? <DisplayPosition map={map} /> : null}
        </div>
      </div>
    </div>
  );
}
