// eslint-disable-next-line @typescript-eslint/no-unused-vars

import { Link, Route, Routes } from 'react-router-dom';
import { Navbar } from '../components';
import NotificationsPage from '../pages/NotificationsPage';
import HomePage from '../pages/HomePage';
import SensorView from '../pages/SensorView';
import Sidebar from '../components/Sidebar';
import { sidebar } from '../core/services/store';
import { useAtom } from 'jotai';

export function App() {
  const [show] = useAtom(sidebar);

  return (
    <>
      <Sidebar />
      <div className={`flex h-screen flex-col${show ? ' blur' : ''}`}>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path={'/:sensorId'} element={<SensorView />} />
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
    </>
  );
}

export default App;
