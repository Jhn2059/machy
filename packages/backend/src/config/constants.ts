export const SHIFTS = {
  MORNING: 'MORNING',
  AFTERNOON: 'AFTERNOON',
  FULL: 'FULL',
  NONE: 'NONE',
} as const;

export type Shift = (typeof SHIFTS)[keyof typeof SHIFTS];

export const SHIFT_SCHEDULES = {
  MORNING: { start: '08:00', end: '13:30' },
  AFTERNOON: { start: '14:00', end: '19:00' },
  FULL: { start: '08:00', end: '19:00' },
  NONE: null,
};

export const ROLES = {
  ADMIN: 'ADMIN',
  SELLER: 'SELLER',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const PRODUCT_STATUS = {
  ACTIVE: 'ACTIVE',
  DISCONTINUED: 'DISCONTINUED',
} as const;

export const SALE_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  VOIDED: 'VOIDED',
} as const;

export const SESSION_TYPE = {
  MANUAL: 'MANUAL',
  INACTIVITY: 'INACTIVITY',
} as const;

export const IGV_RATE = 0.18;
export const INACTIVITY_TIMEOUT_MINUTES = 30;
export const LOGIN_MAX_ATTEMPTS = 5;
export const LOGIN_BLOCK_MINUTES = 15;
export const OTP_EXPIRY_MINUTES = 15;
export const MAX_PRODUCTS = 10000;
