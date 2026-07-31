import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom';

import RolesPage from './pages/roles/RolesPage';
import SignIn from './pages/SignIn';
import Dashboard from './pages/dashboard/Dashboard';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
        path="/forgot-password"
        element={<ForgotPassword />}
        />
        <Route path="/roles" element={<RolesPage />} />

        <Route
        path="/reset-password"
         element={<ResetPassword />}
        />
        <Route path="/" element={<SignIn />} />
        <Route
          path="/dashboard/*"
          element={<Dashboard />}
        />

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}