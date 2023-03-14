import moment from 'moment';
import { useEffect, useState } from 'react';
import { FaCalendarAlt, FaLocationArrow, FaPencilAlt } from 'react-icons/fa';
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const sensor = {
  name: 'Cảm biến 1',
  location: [1, 1],
  connected: true,
  href: `/sensor`,
  breadcrumbs: [{ id: 1, name: 'Trang chủ', href: '/' }],
  data: [
    {
      temperature: 30,
      humidity: 51,
      lux: 67,
      date: 'Mar 9, 2022, 17:03:00',
    },
    {
      temperature: 28,
      humidity: 84,
      lux: 121,
      date: 'Mar 9, 2022, 17:03:30',
    },
    {
      temperature: 32,
      humidity: 80,
      lux: 51,
      date: 'Mar 9, 2022, 17:04:00',
    },
    {
      temperature: 32,
      humidity: 88,
      lux: 128,
      date: 'Mar 9, 2022, 17:04:30',
    },
    {
      temperature: 27,
      humidity: 89,
      lux: 101,
      date: 'Mar 9, 2022, 17:05:00',
    },
  ],
};

export default function SensorView() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return function cleanup() {
      clearInterval(timer);
    };
  });

  return (
    <div className="flex-grow p-2">
      {/* breadcumb */}

      <div className="px-8 pb-4 lg:flex lg:items-center lg:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            {sensor.name}
          </h1>

          <div className="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6">
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <FaLocationArrow
                className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                aria-hidden="true"
              />
              {sensor.location[0]} , {sensor.location[1]}
            </div>
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <span
                className={`text- mr-1.5 inline-block  h-4 w-4  rounded-full align-middle ${
                  sensor.connected ? 'bg-green-500' : 'bg-red-500'
                }`}
              ></span>
              {sensor.connected ? 'Online' : 'Offline'}
            </div>
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <FaCalendarAlt
                className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                aria-hidden="true"
              />
              {time.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}
            </div>
          </div>
        </div>

        <div className="mt-5 flex lg:mt-0 lg:ml-4">
          <span className="hidden sm:block">
            <button
              type="button"
              className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              <FaPencilAlt
                className="-ml-0.5 mr-1.5 h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
              Edit
            </button>
          </span>
          <span className="ml-3 hidden sm:block">
            <button
              type="button"
              className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              <FaCalendarAlt
                className="-ml-0.5 mr-1.5 h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
              View
            </button>
          </span>
        </div>
      </div>

      <main className="flex-grow">
        <div className="flex flex-row flex-wrap">
          <div className="mx-2 block flex-1 bg-white p-6 ">
            <h2 className="text-lg font-bold tracking-tight text-gray-900">
              Nhiệt độ
            </h2>
            <div>
              <ResponsiveContainer width="95%" height={200}>
                <LineChart width={500} height={300} data={sensor.data}>
                  <XAxis
                    dataKey="date"
                    tickFormatter={(unixTime) =>
                      moment(unixTime).format('HH:mm:ss')
                    }
                  />
                  <YAxis />
                  <CartesianGrid stroke="#eee" strokeDasharray="6 6" />
                  <Line
                    type="monotone"
                    dataKey="temperature"
                    stroke="#8884d8"
                  />
                  <Tooltip />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mx-2 block flex-1 bg-white p-6 ">
            <h2 className="text-lg font-bold tracking-tight text-gray-900">
              Độ ẩm
            </h2>

            <div>
              <ResponsiveContainer width="95%" height={200}>
                <LineChart width={500} height={300} data={sensor.data}>
                  <XAxis
                    dataKey="date"
                    tickFormatter={(unixTime) =>
                      moment(unixTime).format('HH:mm:ss')
                    }
                  />
                  <YAxis />
                  <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
                  <Line type="monotone" dataKey="humidity" stroke="#8884d8" />
                  <Tooltip />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="mx-2 block flex-1  bg-white p-6 ">
          <h2 className="text-lg font-bold tracking-tight text-gray-900">
            Cường độ ánh sáng
          </h2>
          <div>
            <ResponsiveContainer width="95%" height={200}>
              <LineChart width={500} height={300} data={sensor.data}>
                <XAxis
                  dataKey="date"
                  tickFormatter={(unixTime) =>
                    moment(unixTime).format('HH:mm:ss')
                  }
                  domain={['auto', 'auto']}
                  name="Thời gian"
                />
                <YAxis />
                <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
                <Line type="monotone" dataKey="lux" stroke="#8884d8" />
                <Tooltip />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </main>
    </div>
  );
}
