import { FaBars, FaBell } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useAtom } from 'jotai'
import { sidebar } from '../store';


const sensor = {
  name: 'Cảm biến 1',
  href: `/sensor`,
  breadcrumbs: [{ id: 1, name: 'Trang chủ', href: '/' }],
};

export function Navbar() {
  const [show,setShow] = useAtom(sidebar)
  return (
    <div className="top-0 flex flex-row bg-white p-4 lg:items-center lg:justify-between">
      <div className="flex items-center">
        <button
          className="mr-5 h-5 w-5 text-xl"
          type="button"
          onClick = {() => setShow(!show)}
        >
          <FaBars />
        </button>
        <ol
          // role="list"
          className="flex max-w-2xl items-center space-x-2 "
        >
          {sensor.breadcrumbs.map((breadcrumb) => (
            <li key={breadcrumb.id}>
              <div className="flex items-center">
                <a href={breadcrumb.href} className="mr-2 text-sm font-medium text-gray-900">
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
      </div>
      <div>
        <Link to={'/notifications'}>
          <span>
            <FaBell className="text-xl" />
          </span>
        </Link>
        {/* <a href="/#"></a> */}
      </div>
    </div>
  );
}
