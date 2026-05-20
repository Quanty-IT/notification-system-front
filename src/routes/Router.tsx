import { Navigate, Route, Routes } from 'react-router-dom';
import {
  CommunicationDetails,
  CreateCommunication,
  Dashboard,
  EditCommunication,
  ForgotPassword,
  SignIn,
  Templates,
  TemplateVersions,
} from '@/pages';
import { ProtectedRoute, ROUTES } from '@/routes';
import { Layout } from '@/shared/components';

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

        <Route path={ROUTES.COMMUNICATIONS.CREATE} element={<CreateCommunication />} />
        <Route path={ROUTES.COMMUNICATIONS.EDIT} element={<EditCommunication />} />
        <Route path={ROUTES.COMMUNICATIONS.DETAILS} element={<CommunicationDetails />} />

        <Route path={ROUTES.TEMPLATES.BASE} element={<Templates />} />
        <Route path={ROUTES.TEMPLATE_VERSIONS.BASE} element={<TemplateVersions />} />
      </Route>

      <Route path='*' element={<Navigate to={ROUTES.DASHBOARD.BASE} replace />} />
    </Routes>
  );
}
