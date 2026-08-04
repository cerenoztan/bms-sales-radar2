import Box from '@mui/material/Box';

import {
  Navigate,
  Route,
  Routes,
} from 'react-router-dom';

import PermissionRoute from '../../auth/PermissionRoute';

import UsersPage from '../users/UsersPage';
import RolesPage from '../roles/RolesPage';
import PermissionsPage from '../permissions/PermissionsPage';

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
            element={
              <PermissionRoute permission="DASHBOARD_VIEW">
                <BusinessGrid />
              </PermissionRoute>
            }
          />

          <Route
            path="businesses"
            element={
              <PermissionRoute permission="BUSINESS_VIEW">
                <BusinessGrid />
              </PermissionRoute>
            }
          />

          <Route
            path="users"
            element={
              <PermissionRoute permission="USER_VIEW">
                <UsersPage />
              </PermissionRoute>
            }
          />

          <Route
            path="roles"
            element={
              <PermissionRoute permission="ROLE_VIEW">
                <RolesPage />
              </PermissionRoute>
            }
          />

          <Route
            path="permissions"
            element={
              <PermissionRoute permission="PERMISSION_VIEW">
                <PermissionsPage />
              </PermissionRoute>
            }
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