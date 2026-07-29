import Box from '@mui/material/Box';

import {
  Navigate,
  Route,
  Routes,
} from 'react-router-dom';

import UsersPage from '../users/UsersPage';
import Sidebar from './Sidebar';
import BusinessGrid from './BusinessGrid';

export default function Dashboard() {
  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        bgcolor: 'grey.50',
      }}
    >
      <Sidebar />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          p: {
            xs: 2,
            md: 4,
          },
        }}
      >
        <Routes>
          <Route
            index
            element={<BusinessGrid />}
          />

          <Route
            path="businesses"
            element={<BusinessGrid />}
          />

          <Route
            path="users"
            element={<UsersPage />}
          />

          <Route
            path="*"
            element={
              <Navigate
                to="/dashboard"
                replace
              />
            }
          />
        </Routes>
      </Box>
    </Box>
  );
}