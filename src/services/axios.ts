import axios, { InternalAxiosRequestConfig } from 'axios';
import { ROUTES } from '../routes/routes.constants';
import { storage } from '../shared';
import { refreshToken } from './auth';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (!config.headers) return config;
  config.headers['x-api-key'] = import.meta.env.VITE_API_KEY;

  if (config.url?.includes('/auth/refresh-token')) return config;

  const token = storage.token.getAccessToken();
  if (token && config.headers) config.headers.Authorization = `Bearer ${token}`;

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isUnauthorized = error.response?.status === 401;
    const isSignInEndpoint = originalRequest.url?.includes('/auth/sign-in');
    const isRefreshEndpoint = originalRequest.url?.includes('/auth/refresh-token');

    if (!isUnauthorized || originalRequest._retry || isSignInEndpoint || isRefreshEndpoint) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    const refreshTokenValue = storage.token.getRefreshToken();
    if (!refreshTokenValue) {
      storage.token.clearTokens();
      window.location.href = ROUTES.AUTH.SIGN_IN;
      return Promise.reject(error);
    }

    try {
      const { accessToken, refreshToken: newRefreshToken } = await refreshToken({ refreshToken: refreshTokenValue });
      storage.token.setTokens(accessToken, newRefreshToken);

      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      return api(originalRequest);
    } catch {
      storage.token.clearTokens();
      window.location.href = '/auth/sign-in';
      return Promise.reject(error);
    }
  },
);
