import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

import { getStoredUser } from './authStorage';

export default function AuthenticatedRoute({ children }: { children: ReactNode }) {
  return getStoredUser() ? children : <Navigate to="/" replace />;
}
