export const ROUTES = {
  AUTH: {
    SIGN_IN: '/auth/sign-in',
    FORGOT_PASSWORD: '/auth/forgot-password',
  },
  DASHBOARD: {
    BASE: '/',
  },
  COMMUNICATIONS: {
    BASE: '/communications',
    DETAILS: '/communications/:id',
  },
  TEMPLATES: {
    BASE: '/templates',
    NEW: '/templates/new',
    DETAIL: '/templates/:id',
  },
} as const;

export const getCommunicationDetailPath = (id: string) => `/communications/${id}`;
