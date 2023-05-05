import { LatLngExpression, Map } from 'leaflet';
import { useEffect, useMemo, useState } from 'react';
import MapEngine from '../components/Map';
import { SensorData } from '../core/domain/Sensor';
import GetAllSensors from '../core/application/GetAllSensors';
import { http } from '../core/services/httpClient';
import SensorAdapter from '../core/services/SensorAdapter';
import SSE from '../core/services/SseClient';
import GetClientId from '../core/application/StreamSensorList';
import ReadEventAdapter from '../core/services/ReadEventAdapter';

export default function HomePage() {
  const [page] = useState(1);
  const [sensor, setData] = useState<SensorData[]>([]);
  const [clientId, setClientId] = useState('');

  useMemo(() => {
    const sensorAdapter = new SensorAdapter(http);
    new GetAllSensors(sensorAdapter, page).executeUsecase().then((result) => setData(result));
  }, [page]);

  useMemo(() => {
    const sensorIds = sensor.map((e) => e.id);
    new GetClientId(new ReadEventAdapter(http), sensorIds)
      .executeUsecase()
      .then((result) => setClientId(result));
  }, [sensor]);

  const [map, setMap] = useState<Map | null>(null);
  const zoom = 13;

  useEffect(() => {
    if (clientId === '') return;
    const sse = new SSE(clientId);
    function getRealtimeData(data: SensorData[]) {
      setData(data);
    }
    sse.eventSource.onmessage = (e) => getRealtimeData(JSON.parse(e.data));
    sse.eventSource.onerror = () => {
      // error log here
      console.log('error');
      sse.eventSource.close();
    };
    return () => {
      sse.eventSource.close();
    };
  }, [clientId]);

  // useEffect(() => {
  //   const interval = setInterval(async () => {
  //     try {
  //       const response = await fetchPagedSensors(1);
  //       const data = await response.data;
  //       getData(data);
  //     } catch (error) {
  //       console.log('An error occurred');
  //       clearInterval(interval);
  //     }
  //   }, 2000);
  //   return () => clearInterval(interval);
  // }, []);

  const handleClickOnMap = (position: LatLngExpression): void => {
    if (map === null) return;
    map.setView(position, zoom);
    setMap(map);
  };

  return (
    <div className="h-full flex-grow p-2">
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
              {sensor.length !== 0
                ? sensor.map((sensorData) => (
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
                    </tr>
                  ))
                : Array.from({ length: 10 }).map((value, id) => (
                    <tr key={id} className="cursor-pointer border-b-2 hover:bg-gray-100">
                      <td className="py-2 text-center">
                        <div className="inline-block h-2.5 w-24 rounded-full bg-gray-300 align-middle"></div>
                      </td>
                      <td className="py-2 text-center">
                        <span
                          className={`text- inline-block h-4  w-4 rounded-full bg-gray-300 align-middle`}
                        ></span>
                      </td>
                      <td className="py-2 text-center">
                        <div className="inline-block h-2.5 w-20 rounded-full bg-gray-300 align-middle"></div>
                      </td>
                      <td className="py-2 text-center">
                        <div className="inline-block h-2.5 w-20 rounded-full bg-gray-300 align-middle"></div>
                      </td>
                      <td className="py-2 text-center">
                        <div className="inline-block h-2.5 w-20 rounded-full bg-gray-300 align-middle"></div>
                      </td>
                      <td className="py-2 text-center">
                        <div className="inline-block h-2.5 w-20 rounded-full bg-gray-300 align-middle"></div>
                      </td>
                      <td className="py-2 text-center">
                        <div className="inline-block h-2.5 w-4 rounded-full bg-gray-300 align-middle"></div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
          {/* <div className="my-4 flex w-full flex-row justify-end gap-10">
            <div className="flex flex-row gap-2">
              <span>Trang thứ</span>
              <span className="w-4 border-b-2 border-black text-center">2</span>
            </div>
            <div className="flex flex-row">
              <FaCaretLeft className="mx-2 h-full cursor-pointer" />
              <FaCaretRight className="mx-2 h-full cursor-pointer" />
            </div>
          </div> */}
        </div>
        <div className="relative col-span-2 mx-1 h-full rounded-md">
          <MapEngine
            className="z-0 h-full"
            setMap={setMap}
            data={sensor.map((el) => ({
              id: el.id,
              name: el.name,
              connected: el.connected,
              location: el.location,
            }))}
          />
        </div>
      </div>
    </div>
  );
}
