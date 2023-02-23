import { FaCaretLeft, FaCaretRight, FaEye } from 'react-icons/fa';

interface GeoPosition {
  latitude: number;
  longtitude: number;
}

interface SensorData {
  id: number;
  name: string;
  isOnline: boolean;
  temperature: number;
  humidity: number;
  lux: number;
  windSpeed: number;

  location: GeoPosition;
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

    location: { latitude: 1, longtitude: 1 },
  },
  {
    id: 2,
    name: 'Cảm biến 2',
    isOnline: false,
    temperature: 1,
    humidity: 1,
    lux: 1,
    windSpeed: 1,

    location: { latitude: 1, longtitude: 1 },
  },
  {
    id: 3,
    name: 'Cảm biến 3',
    isOnline: false,
    temperature: 1,
    humidity: 1,
    lux: 1,
    windSpeed: 1,

    location: { latitude: 1, longtitude: 1 },
  },
  {
    id: 4,
    name: 'Cảm biến 4',
    isOnline: true,
    temperature: 1,
    humidity: 1,
    lux: 1,
    windSpeed: 1,

    location: { latitude: 1, longtitude: 1 },
  },
  {
    id: 5,
    name: 'Cảm biến 1',
    isOnline: true,
    temperature: 1,
    humidity: 1,
    lux: 1,
    windSpeed: 1,

    location: { latitude: 1, longtitude: 1 },
  },
  {
    id: 6,
    name: 'Cảm biến 2',
    isOnline: false,
    temperature: 1,
    humidity: 1,
    lux: 1,
    windSpeed: 1,

    location: { latitude: 1, longtitude: 1 },
  },
  {
    id: 7,
    name: 'Cảm biến 3',
    isOnline: false,
    temperature: 1,
    humidity: 1,
    lux: 1,
    windSpeed: 1,

    location: { latitude: 1, longtitude: 1 },
  },
  {
    id: 8,
    name: 'Cảm biến 4',
    isOnline: true,
    temperature: 1,
    humidity: 1,
    lux: 1,
    windSpeed: 1,

    location: { latitude: 1, longtitude: 1 },
  },
  {
    id: 9,
    name: 'Cảm biến 3',
    isOnline: false,
    temperature: 1,
    humidity: 1,
    lux: 1,
    windSpeed: 1,

    location: { latitude: 1, longtitude: 1 },
  },
  {
    id: 10,
    name: 'Cảm biến 4',
    isOnline: true,
    temperature: 1,
    humidity: 1,
    lux: 1,
    windSpeed: 1,

    location: { latitude: 1, longtitude: 1 },
  },
];

export default function HomePage() {
  return (
    <div className="flex-grow p-2">
      <div className="grid h-full grid-cols-3 gap-2">
        <div className="col-span-2 flex flex-col">
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
        <div className="col-span-1 h-full rounded-md border">
          This is where the map locate
        </div>
      </div>
    </div>
  );
}
