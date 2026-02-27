import { z } from 'zod';
import { USER_ROLES_VALUES } from '../../constants/user.constants.js';

// Update own profile schema
export const updateOwnProfileSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters')
    .optional(),
});

// Change password schema
export const changePasswordSchema = z.object({
  oldPassword: z.string()
    .min(1, 'Old password is required'),

  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(32, 'Password must not exceed 32 characters')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

// Update user schema (for admins)
export const updateUserSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters')
    .optional(),

  role: z.enum(USER_ROLES_VALUES, {
    error: 'Invalid user role',
  }).optional(),
});

// List users query schema
export const listUsersQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  role: z.enum(USER_ROLES_VALUES).optional(),
  isApproved: z.enum(['true', 'false']).transform(val => val === 'true').optional(),
  isVerified: z.enum(['true', 'false']).transform(val => val === 'true').optional(),
  search: z.string().optional(),
});
