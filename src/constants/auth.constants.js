import dotenv from 'dotenv';

dotenv.config();

export const TOKEN_TYPES = {
  ACCESS: 'ACCESS',
  EMAIL_VERIFICATION: 'EMAIL_VERIFICATION',
  PASSWORD_RESET: 'PASSWORD_RESET',
};

export const TOKEN_EXPIRY = {
  ACCESS_TOKEN: '15m',
  EMAIL_VERIFICATION: '24h',
  PASSWORD_RESET: '1h',
};

export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
};

export const selectUserFields = {
  id: true,
  email: true,
  name: true,
  role: true,
  isVerified: true,
  institutionId: true,
}

export const ACCESS_TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

export const PASSWORD_RESET_TOKEN_EXPIRY_HOURS = 1;
export const EMAIL_VERIFICATION_TOKEN_EXPIRY_HOURS = 24;
