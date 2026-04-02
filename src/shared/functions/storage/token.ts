const ACCESS_TOKEN_KEY = '@friendly-snout:accessToken';
const REFRESH_TOKEN_KEY = '@friendly-snout:refreshToken';

const getAccessToken = (): string | null => {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

const getRefreshToken = (): string | null => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

const setTokens = (accessToken: string, refreshToken: string): void => {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

const clearTokens = (): void => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

const hasTokens = (): boolean => {
  return !!(getAccessToken() && getRefreshToken());
};

export const token = {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
  hasTokens,
};
