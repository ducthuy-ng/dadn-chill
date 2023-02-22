import { FaBars, FaBell } from 'react-icons/fa';
import { Link } from 'react-router-dom';

export function Navbar() {
  return (
    <div className="sticky top-0  flex flex-row justify-between bg-white p-4 shadow-md">
      <div>
        <FaBars className="text-xl" />
      </div>
      <div>Insert Logo</div>
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
