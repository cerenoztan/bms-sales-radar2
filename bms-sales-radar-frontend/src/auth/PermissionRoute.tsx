import type { ReactNode } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';

import { Navigate } from 'react-router-dom';

import {
  getStoredUser,
  hasPermission,
} from './authStorage';

interface PermissionRouteProps {
  permission: string;
  children: ReactNode;
}

export default function PermissionRoute({
  permission,
  children,
}: PermissionRouteProps) {
  const user = getStoredUser();

  if (!user) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  if (!hasPermission(permission)) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Bu sayfaya erişim yetkiniz yok.
        </Alert>
      </Box>
    );
  }

  return children;
}