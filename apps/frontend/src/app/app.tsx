// eslint-disable-next-line @typescript-eslint/no-unused-vars

import { Route, Routes } from 'react-router-dom';
import { Navbar } from '../components';
import NotificationsPage from '../pages/NotificationsPage';
import HomePage from '../pages/HomePage';
import Sidebar from '../components/Sidebar';
import { getUser, sidebar } from '../core/services/store';
import { useAtom } from 'jotai';
import NotFound from '../pages/NotFound';
import LoginForm from '../components/LoginForm';
import AnalysisPage from '../pages/AnalysisPage';

export function App() {
  const [show] = useAtom(sidebar);
  const [user] = useAtom(getUser);

  if (!user || user.id === '') {
    console.log(user);
    return <LoginForm />;
  }

  return (
    <div className="login-wrapper">
      <Navbar />
      <Sidebar />
      <div className={`h-screen pt-12 ${show ? ' ml-64' : ''}`}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/analysis" element={<AnalysisPage />} />
          <Route path="/*" element={<NotFound />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
