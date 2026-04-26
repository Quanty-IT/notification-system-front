export const ROUTES = {
  DASHBOARD: {
    BASE: '/',
  },
  COMMUNICATIONS: {
    DETAIL: '/communications/:id',
    byId: (id: string) => `/communications/${id}`,
  },
  AUTH: {
    SIGN_IN: '/auth/sign-in',
    FORGOT_PASSWORD: '/auth/forgot-password',
  },
  TEMPLATES: {
    BASE: '/templates',
    NEW: '/templates/new',
    DETAIL: '/templates/:id',
  },
} as const;
