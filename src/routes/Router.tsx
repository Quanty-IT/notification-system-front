import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from '../components/layout.tsx';
import { Dashboard, ForgotPassword, SignIn } from '../pages';
import { Templates } from '../pages/templates';
import { ProtectedRoute } from './ProtectedRoute.tsx';
import { ROUTES } from './routes.constants.ts';

export function Router() {
  return (
    <Routes>
      <Route
        path={ROUTES.AUTH.SIGN_IN}
        element={
          <ProtectedRoute requireAuth={false}>
            <SignIn />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.AUTH.FORGOT_PASSWORD}
        element={
          <ProtectedRoute requireAuth={false}>
            <ForgotPassword />
          </ProtectedRoute>
        }
      />

      <Route
        element={
          <ProtectedRoute requireAuth={true}>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path={ROUTES.DASHBOARD.BASE} element={<Dashboard />} />
        <Route path={ROUTES.TEMPLATES.BASE} element={<Templates />} />
      </Route>

      <Route path='/' element={<Navigate to={ROUTES.DASHBOARD.BASE} replace />} />
      <Route path='*' element={<Navigate to={ROUTES.DASHBOARD.BASE} replace />} />
    </Routes>
  );
}
