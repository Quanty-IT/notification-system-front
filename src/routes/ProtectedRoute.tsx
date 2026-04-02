import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts';
import { ROUTES } from './routes.constants';

interface ProtectedRouteProps {
  children: React.ReactElement;
  requireAuth?: boolean;
}

export function ProtectedRoute({ children, requireAuth = true }: ProtectedRouteProps) {
  const { isAuthenticated } = useAuth();

  if (requireAuth && !isAuthenticated) return <Navigate to={ROUTES.AUTH.SIGN_IN} replace />;
  if (!requireAuth && isAuthenticated) return <Navigate to={ROUTES.DASHBOARD.BASE} replace />;

  return children;
}
