import { useEffect, useState } from 'react';
import { FaCalendarAlt, FaLocationArrow, FaPencilAlt } from 'react-icons/fa';

const sensor = {
  name: 'Cảm biến 1',
  location: [1, 1],
  connected: true,
  href: '/sensor',
  breadcrumbs: [{ id: 1, name: 'Trang chủ', href: '/' }],
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

      <nav aria-label="Breadcrumb">
        <ol
          // role="list"
          className="flex max-w-2xl items-center space-x-2 px-4 pt-4 pb-2 sm:px-6 lg:max-w-7xl lg:px-8"
        >
          {sensor.breadcrumbs.map((breadcrumb) => (
            <li key={breadcrumb.id}>
              <div className="flex items-center">
                <a
                  href={breadcrumb.href}
                  className="mr-2 text-sm font-medium text-gray-900"
                >
                  {breadcrumb.name}
                </a>
                <svg
                  width={16}
                  height={20}
                  viewBox="0 0 16 20"
                  fill="currentColor"
                  aria-hidden="true"
                  className="h-5 w-4 text-gray-300"
                >
                  <path d="M5.697 4.34L8.98 16.532h1.327L7.025 4.341H5.697z" />
                </svg>
              </div>
            </li>
          ))}
          <li className="text-sm">
            <a
              href={sensor.href}
              aria-current="page"
              className="font-medium text-gray-500 hover:text-gray-600"
            >
              {sensor.name}
            </a>
          </li>
        </ol>
      </nav>

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

      <main className="flex-grow border-2">
        <div className="flex flex-row flex-wrap border-2 p-2">
          <div className="mx-2 block flex-1 rounded-xl border border-gray-200 bg-white p-6 shadow">
            <h2 className="text-lg font-bold tracking-tight text-gray-900">
              Nhiệt độ
            </h2>
            <div></div>
          </div>

          <div className="mx-2 block flex-1 rounded-xl border border-gray-200 bg-white p-6 shadow">
            <h2 className="text-lg font-bold tracking-tight text-gray-900">
              Độ ẩm
            </h2>
            <div></div>
          </div>
        </div>

        <div className="flex flex-row flex-wrap border-2 p-2">
          <div className="mx-2 block flex-1 rounded-xl border border-gray-200 bg-white p-6 shadow">
            <h2 className="text-lg font-bold tracking-tight text-gray-900">
              Tốc độ gió
            </h2>
            <div></div>
          </div>

          <div className="mx-2 block flex-1 rounded-xl border border-gray-200 bg-white p-6 shadow">
            <h2 className="text-lg font-bold tracking-tight text-gray-900">
              Cường độ ánh sáng
            </h2>
            <div></div>
          </div>
        </div>
      </main>
    </div>
  );
}
