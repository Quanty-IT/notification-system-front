import { api } from '../axios';
import * as T from './types';

export const signIn = async ({ email, password }: T.SignInRequest) => {
  const { data } = await api.post<T.SignInResponse>('/auth/sign-in', {
    email,
    password,
  });
  return data;
};

export const refreshToken = async ({ refreshToken }: T.RefreshTokenRequest) => {
  const { data } = await api.post<T.RefreshTokenResponse>('/auth/refresh-token', {
    refreshToken,
  });
  return data;
};
