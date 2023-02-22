// eslint-disable-next-line @typescript-eslint/no-unused-vars

import { Link, Route, Routes } from 'react-router-dom';
import { Navbar } from '../components';
import NotificationsPage from '../pages/NotificationsPage';
import HomePage from '../pages/HomePage';

// import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';

export function App() {
  return (
    <div className='flex flex-col h-screen'>
      <Navbar />
      {/* <br />
      <div role="navigation">
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/page-2">Page 2</Link>
          </li>
        </ul>
      </div> */}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/notifications" element={<NotificationsPage />}></Route>
        <Route
          path="/page-2"
          element={
            <div>
              <Link to="/">Click here to go back to root page.</Link>
            </div>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
