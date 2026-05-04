export const ACTION = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
  SAVE: 'save',
  EDIT: 'edit',
} as const;

export const ROLENAME = {
  ADMIN: 'admin',
  LECTURER: 'lecturer',
  TRAINEES: 'trainees',
} as const;

export const STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
  COMPLETED: 'completed',
} as const;

export const TOKEN = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
} as const;

export const COOKIE_SETTINGS = {
  httpOnly: true,
  secure: true,
  sameSite: 'none' as const,
};

export const THEME = {
  DARK: 'dark',
  LIGHT: 'light',
} as const;
