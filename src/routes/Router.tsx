import { Route, Routes } from 'react-router-dom';
import { ForgotPassword, SignIn } from '../pages';
import { ROUTES } from './routes.constants';

export function Router() {
  return (
    <Routes>
      <Route path={ROUTES.AUTH.SIGN_IN} element={<SignIn />} />
      <Route path={ROUTES.AUTH.FORGOT_PASSWORD} element={<ForgotPassword />} />
    </Routes>
  );
}
