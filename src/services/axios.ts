import axios, { InternalAxiosRequestConfig, AxiosError } from 'axios';
import { ROUTES } from '../routes/routes.constants';
import { storage } from '../shared';
import { refreshToken as refreshTokenService } from './auth';

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (!config.headers) return config;

  config.headers['x-api-key'] = import.meta.env.VITE_API_KEY;

  if (config.url?.includes('/auth/refresh-token')) return config;

  const token = storage.token.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

    if (!originalRequest) return Promise.reject(error);

    const isUnauthorized = error.response?.status === 401;
    const isSignInEndpoint = originalRequest.url?.includes('/auth/sign-in');
    const isRefreshEndpoint = originalRequest.url?.includes('/auth/refresh-token');

    if (!isUnauthorized || isSignInEndpoint || isRefreshEndpoint) {
      return Promise.reject(error);
    }

    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers = originalRequest.headers ?? {};
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    const refreshTokenValue = storage.token.getRefreshToken();

    if (!refreshTokenValue) {
      isRefreshing = false;
      storage.token.clearTokens();
      window.location.href = ROUTES.AUTH.SIGN_IN;
      return Promise.reject(error);
    }

    try {
      const response = await refreshTokenService({ refreshToken: refreshTokenValue });
      const { accessToken, refreshToken: newRefreshToken } = response;

      storage.token.setTokens(accessToken, newRefreshToken);

      processQueue(null, accessToken);

      originalRequest.headers = originalRequest.headers ?? {};
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      storage.token.clearTokens();

      window.location.href = ROUTES.AUTH.SIGN_IN;
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);