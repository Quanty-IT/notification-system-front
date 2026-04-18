import { Route, Routes, Navigate } from 'react-router-dom';
import { Dashboard, ForgotPassword, SignIn } from '../pages';
import { ProtectedRoute } from './ProtectedRoute.tsx';
import { ROUTES } from './routes.constants.ts';
import { AppLayout } from '../components/layout.tsx'; // Certifique-se de criar este arquivo

export function Router() {
  return (
    <Routes>
      {/* --- ROTAS PÚBLICAS (Sem Sidebar) --- */}
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

      {/* --- ROTAS PROTEGIDAS (Com Sidebar via Layout) --- */}
      <Route
        element={
          <ProtectedRoute requireAuth={true}>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        {/* Todas as rotas aqui dentro renderizarão dentro do Outlet do AppLayout */}
        <Route path={ROUTES.DASHBOARD.BASE} element={<Dashboard />} />

        {/* Exemplo de futuras rotas:
        <Route path="/templates" element={<Templates />} /> 
        */}
      </Route>

      {/* Redirecionamento para rota não encontrada ou raiz */}
      <Route path="/" element={<Navigate to={ROUTES.DASHBOARD.BASE} replace />} />
      <Route path="*" element={<Navigate to={ROUTES.DASHBOARD.BASE} replace />} />
    </Routes>
  );
}