// eslint-disable-next-line @typescript-eslint/no-unused-vars

import { Route, Routes } from 'react-router-dom';
import { Navbar } from '../components';
import NotificationsPage from '../pages/NotificationsPage';
import HomePage from '../pages/HomePage';
import SensorView from '../pages/SensorView';
import Sidebar from '../components/Sidebar';
import { getToken, sidebar } from '../core/services/store';
import { useAtom } from 'jotai';
import NotFound from '../pages/NotFound';
import LoginForm from '../components/LoginForm';
import AnalysisPage from '../pages/AnalysisPage';

export function App() {
  const [show] = useAtom(sidebar);
  const [token] = useAtom(getToken);

  if (!token) {
    return <LoginForm />;
  }

  return (
    <div className="login-wrapper">
      <Navbar />
      <Sidebar />
      <div className={`h-screen pt-12 ${show ? ' ml-64' : ''}`}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/noti" element={<NotificationsPage />} />
          <Route path="/analysis" element={<AnalysisPage />} />
          <Route path={'/sensor/:sensorId'} element={<SensorView />} />
          <Route path="/*" element={<NotFound />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
