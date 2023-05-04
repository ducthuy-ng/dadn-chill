import moment from 'moment';
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Pie,
  PieChart,
  Cell,
  Label,
} from 'recharts';
import MapEngine from '../components/Map';
import { SensorMetadata } from '../core/domain/Sensor';

const sensor: SensorMetadata = {
  name: 'Cảm biến 1',
  id: 'sensor-001',
  location: [10.552493, 106.873474],
  connected: true,
};

const timeseries = [
  {
    temperature: 30,
    humidity: 51,
    lux: 67,
    moist: 59,
    date: 'Mar 9, 2022, 17:03:00',
  },
  {
    temperature: 28,
    humidity: 84,
    lux: 121,
    moist: 61,
    date: 'Mar 9, 2022, 17:03:30',
  },
  {
    temperature: 32,
    humidity: 80,
    lux: 51,
    moist: 63,
    date: 'Mar 9, 2022, 17:04:00',
  },
  {
    temperature: 32,
    humidity: 88,
    lux: 128,
    moist: 67,
    date: 'Mar 9, 2022, 17:04:30',
  },
  {
    temperature: 27,
    humidity: 89,
    lux: 101,
    moist: 70,
    date: 'Mar 9, 2022, 17:05:00',
  },
];

const noti = [
  { name: 'Mất kết nối', value: 4 },
  { name: 'Khô hạn', value: 2 },
  { name: 'Nguy cơ cháy rừng', value: 1 },
];

const COLORS = ['#0088FE', '#FF8042', '#00C49F'];

export default function AnalysisPage() {
  return (
    <div className="p-4 ">
      <div className="flex justify-between p-2">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Thống kê</h1>
      </div>

      <div className="grid grid-cols-5 gap-2 p-2">
        <div className="col-span-2 grid h-full grid-rows-2 gap-2">
          <div className="block w-full rounded-lg border border-gray-200 bg-white shadow">
            {/* Temperature */}
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                width={480}
                height={300}
                data={timeseries}
                margin={{ top: 50, left: 0, right: 50, bottom: 0 }}
              >
                <XAxis
                  dataKey="date"
                  tickFormatter={(unixTime) => moment(new Date(unixTime)).format('HH:mm:ss')}
                  tick={{ fontSize: ' 0.7rem' }}
                  domain={['auto', 'auto']}
                  name="Thời gian"
                />
                <YAxis tick={{ fontSize: ' 0.7rem' }} />
                <CartesianGrid strokeDasharray="3 3" />
                <Line type="monotone" dataKey="temperature" stroke="#d62828" strokeWidth={2} />
                <Legend verticalAlign="bottom" height={36} />
                <Tooltip />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="block w-full rounded-lg border border-gray-200 bg-white shadow">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                width={480}
                height={300}
                data={timeseries}
                margin={{ top: 50, left: 0, right: 50, bottom: 0 }}
              >
                <XAxis
                  dataKey="date"
                  tickFormatter={(unixTime) => moment(new Date(unixTime)).format('HH:mm:ss')}
                  domain={['auto', 'auto']}
                  name="Thời gian"
                  tick={{ fontSize: ' 0.7rem' }}
                />
                <YAxis tick={{ fontSize: ' 0.7rem' }} />
                <CartesianGrid strokeDasharray="3 3" />
                <Line type="monotone" dataKey="humidity" stroke="#2ec4b6" strokeWidth={2} />
                <Line type="monotone" dataKey="moist" stroke="#bc6c25" strokeWidth={2} />
                <Legend verticalAlign="bottom" height={36} />
                <Tooltip />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* <div className="col-span-1 pl-1">
              
            </div> */}
        </div>

        <div className="col-span-2 grid h-full grid-rows-2 gap-2">
          <div className="block h-full w-full rounded-lg border border-gray-200 bg-white shadow">
            <MapEngine data={[sensor]} className="z-0 h-full" />
          </div>
          <div className="block h-full w-full rounded-lg border border-gray-200 bg-white shadow">
            {/* Lux */}
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                width={480}
                height={300}
                data={timeseries}
                margin={{ top: 50, left: 0, right: 50, bottom: 0 }}
              >
                <XAxis
                  dataKey="date"
                  tickFormatter={(unixTime) => moment(new Date(unixTime)).format('HH:mm:ss')}
                  domain={['auto', 'auto']}
                  name="Thời gian"
                  tick={{ fontSize: ' 0.7rem' }}
                />
                <YAxis tick={{ fontSize: ' 0.7rem' }} />
                <CartesianGrid strokeDasharray="3 3" />
                <Line type="monotone" dataKey="lux" stroke="#f48c06" strokeWidth={2} />
                <Legend verticalAlign="bottom" height={36} />
                <Tooltip />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="col-span-1 grid h-full grid-rows-2 gap-2">
          <div className="row-span-1 block max-w-sm rounded-lg border border-gray-200 bg-white p-2 shadow">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart width={400} height={400}>
                <Pie
                  data={noti}
                  cx="50%"
                  cy="50%"
                  label
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  <Label className="text-3xl font-bold text-black" position="center">
                    {`${noti.reduce((prev, cur) => prev + cur.value, 0)}`}
                  </Label>
                  {noti.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="row-span-1 block max-w-sm rounded-lg border border-gray-200 bg-white p-2 shadow"></div>
        </div>
      </div>
    </div>
  );
}
