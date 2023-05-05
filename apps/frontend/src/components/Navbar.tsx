import { FaBars, FaBell } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useAtom } from 'jotai';
import { sidebar } from '../core/services/store';

export function Navbar() {
  const [show, setShow] = useAtom(sidebar);

  return (
    <div className="fixed top-0 left-0 z-50 flex w-full flex-row border-b border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 lg:items-center lg:justify-between">
      <div className="flex items-center">
        <button className="ml-2 mr-4 h-5 w-5 text-xl" type="button" onClick={() => setShow(!show)}>
          <FaBars className=" text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700" />
        </button>
      </div>
      <div>
        <Link to={'/notifications'}>
          <span>
            <FaBell className="text-xl  text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700" />
          </span>
        </Link>
      </div>
    </div>
  );
}
