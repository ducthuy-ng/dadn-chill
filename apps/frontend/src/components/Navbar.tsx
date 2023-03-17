import { FaBars, FaBell } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useAtom } from 'jotai';
import { sidebar } from '../store';

export function Navbar() {
  const [show, setShow] = useAtom(sidebar);

  return (
    <div className="top-0 flex flex-row bg-white p-4 lg:items-center lg:justify-between">
      <div className="flex items-center">
        <button className="ml-2 mr-4 h-5 w-5 text-xl" type="button" onClick={() => setShow(!show)}>
          <FaBars />
        </button>
      </div>
      <div>
        <Link to={'/notifications'}>
          <span>
            <FaBell className="text-xl" />
          </span>
        </Link>
      </div>
    </div>
  );
}
