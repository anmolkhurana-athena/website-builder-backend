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

// List users query schema
export const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),

  search: z.string().optional(),
  role: z.enum(USER_ROLES_VALUES).optional(),

  isActive: z.enum(['true', 'false'], {
    invalid_type_error: 'isActive filter must be a boolean value',
  })
    .transform(val => val === 'true').optional(),

  isVerified: z.enum(['true', 'false'], {
    invalid_type_error: 'isVerified filter must be a boolean value',
  })
    .transform(val => val === 'true').optional(),

  created_after: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: 'created_after must be a valid date string',
  })
    .optional(),
});

// Update user role schema
export const updateUserRoleSchema = z.object({
  role: z.enum(USER_ROLES_VALUES, {
    error: () => ({ message: `Invalid user role` }),
  }),
});

// Update user status schema
export const updateUserStatusSchema = z.object({
  active: z.enum(['true', 'false'], {
    required_error: 'Active status is required',
    invalid_type_error: 'Active status must be a boolean value',
  })
    .transform(val => val === 'true')
});