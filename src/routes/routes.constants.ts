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
    EDIT: '/communications/:id/edit',
    CREATE: '/communications/create',
  },
  TEMPLATES: {
    BASE: '/templates',
    NEW: '/templates/new',
    DETAIL: '/templates/:id',
  },
  TEMPLATE_VERSIONS: {
    BASE: '/templates/:id/versions',
  },
} as const;

export const getCommunicationDetailPath = (id: string) => `/communications/${id}`;
export const getUpdateCommunicationPath = (id: string) => `/communications/${id}/edit`;
export const getCreateCommunicationPath = () => '/communications/create';
