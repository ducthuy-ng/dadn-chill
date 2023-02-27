import { useEffect, useState } from 'react';
import Map, { convertDevice } from '../components/Map';
import { FaCaretLeft, FaCaretRight, FaEye } from 'react-icons/fa';
import { LatLngExpression } from 'leaflet';

convertDevice({ id: 'abc', connected: false, lat: 12, lng: 10 })


interface SensorData {
  id: number;
  name: string;
  isOnline: boolean;
  temperature: number;
  humidity: number;
  lux: number;
  windSpeed: number;

  location: LatLngExpression;
}

const sensorDummyData: SensorData[] = [
  {
    id: 1,
    name: 'Cảm biến 1',
    isOnline: true,
    temperature: 1,
    humidity: 1,
    lux: 1,
    windSpeed: 1,

    location: [ 10.552493,106.873474 ],
  },
  {
    id: 2,
    name: 'Cảm biến 2',
    isOnline: false,
    temperature: 1,
    humidity: 1,
    lux: 1,
    windSpeed: 1,

    location: [ 10.5390624, 106.879069 ],
  },
  {
    id: 3,
    name: 'Cảm biến 3',
    isOnline: false,
    temperature: 1,
    humidity: 1,
    lux: 1,
    windSpeed: 1,

    location: [ 10.5257651, 106.8480182 ],
  },
  {
    id: 4,
    name: 'Cảm biến 4',
    isOnline: true,
    temperature: 1,
    humidity: 1,
    lux: 1,
    windSpeed: 1,

    location: [ 10.5122799, 106.7979179 ],
  },
  {
    id: 5,
    name: 'Cảm biến 5',
    isOnline: true,
    temperature: 1,
    humidity: 1,
    lux: 1,
    windSpeed: 1,

    location: [ 10.478189, 106.839396 ],
  },
  // {
  //   id: 6,
  //   name: 'Cảm biến 2',
  //   isOnline: false,
  //   temperature: 1,
  //   humidity: 1,
  //   lux: 1,
  //   windSpeed: 1,

  //   location: [],
  // },
  // {
  //   id: 7,
  //   name: 'Cảm biến 3',
  //   isOnline: false,
  //   temperature: 1,
  //   humidity: 1,
  //   lux: 1,
  //   windSpeed: 1,

  //   location: [],
  // },
  // {
  //   id: 8,
  //   name: 'Cảm biến 4',
  //   isOnline: true,
  //   temperature: 1,
  //   humidity: 1,
  //   lux: 1,
  //   windSpeed: 1,

  //   location: [],
  // },
  // {
  //   id: 9,
  //   name: 'Cảm biến 3',
  //   isOnline: false,
  //   temperature: 1,
  //   humidity: 1,
  //   lux: 1,
  //   windSpeed: 1,

  //   location: [],
  // },
  // {
  //   id: 10,
  //   name: 'Cảm biến 4',
  //   isOnline: true,
  //   temperature: 1,
  //   humidity: 1,
  //   lux: 1,
  //   windSpeed: 1,

  //   location: [],
  // },
];

export default function HomePage() {
  const [selectedId, SetSelectedId] = useState('');

  useEffect(() => console.log(selectedId), [selectedId]);

  return (
    <div className="flex-grow p-2">
      <div className="grid h-full grid-cols-5 gap-2">
        <div className="col-span-3 flex flex-col mx-1">
          <h1 className="m-4 text-3xl font-bold">Cảm biến</h1>
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="border-b-2">
                <th className="py-2">Tên cảm biến</th>
                <th className="py-2">Online</th>
                <th className="py-2">Nhiệt độ</th>
                <th className="py-2">Độ ẩm</th>
                <th className="py-2">Ánh sáng</th>
                <th className="py-2">Tốc độ gió</th>
                <th className="py-2">&nbsp;</th>
              </tr>
            </thead>
            <tbody>
              {sensorDummyData.map((sensorData) => (
                <tr
                  key={sensorData.id}
                  className="cursor-pointer border-b-2 hover:bg-gray-100"
                >
                  <td className="py-2 text-center">{sensorData.name}</td>
                  <td className="py-2 text-center">
                    <span
                      className={`text- inline-block h-4  w-4 rounded-full  align-middle ${
                        sensorData.isOnline ? 'bg-green-500' : 'bg-red-500'
                      }`}
                    ></span>
                  </td>
                  <td className="py-2 text-center">{sensorData.temperature}</td>
                  <td className="py-2 text-center">{sensorData.humidity}</td>
                  <td className="py-2 text-center">{sensorData.lux}</td>
                  <td className="py-2 text-center">{sensorData.windSpeed}</td>
                  <td className="py-2 text-center">
                    <FaEye />
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
        <div className="col-span-2 h-full rounded-md border mx-1">
          <Map
            selectedId={selectedId}
            setSelectedId={SetSelectedId}
            data={[
              {
                id: 'sensor-005',
                connected: true,
                lat: 10.478189,
                lng: 106.839396,
              },
            ].map((el) =>
              convertDevice({
                id: el.id,
                connected: el.connected,
                lat: el.lat,
                lng: el.lng,
              })
            )}
          />
        </div>
      </div>
    </div>
  );
}
