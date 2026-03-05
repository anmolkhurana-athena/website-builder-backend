import express from 'express';
import UserController from './user.controller.js';
import { authenticate, authorize } from '../../middlewares/auth.middleware.js';
import { validateRequest } from '../../middlewares/validation.middleware.js';
import {
  updateOwnProfileSchema,
  changePasswordSchema,
  listUsersQuerySchema,
  updateUserRoleSchema,
  updateUserStatusSchema,
} from './user.validation.js';
import { USER_ROLES } from '../../constants/user.constants.js';

const router = express.Router();
const userController = new UserController();

// All routes require authentication
router.use(authenticate);

// GET /users/me - Get own profile (all authenticated users)
router.get('/me', userController.getProfile);

// PUT /users/me - Update own profile (all authenticated users)
router.put(
  '/me',
  validateRequest(updateOwnProfileSchema),
  userController.updateOwnProfile
);

// PATCH /users/me/change-password - Change own password (all authenticated users)
router.post(
  '/me/change-password',
  validateRequest(changePasswordSchema),
  userController.changePassword
);

// DELETE /users/me - own Account Deactivation
router.delete(
  '/me',
  userController.deactivateAccount
);

// GET /users - List users (Admin only)
router.get(
  '/',
  authorize([USER_ROLES.ADMIN]),
  validateRequest(listUsersQuerySchema, 'query'),
  userController.listUsers
);

// GET /users/:id - Get user by ID
router.get(
  '/:id',
  authorize([USER_ROLES.ADMIN]),
  userController.getUserById
);

// PUT /users/:id/role - Update user role (Admin only)
router.patch(
  '/:id/role',
  authorize([USER_ROLES.ADMIN]),
  validateRequest(updateUserRoleSchema),
  userController.updateUserRole
);

// PATCH /users/:id/status - Suspend/Reactivate user (Admin only)
router.patch(
  '/:id/status',
  authorize([USER_ROLES.ADMIN]),
  validateRequest(updateUserStatusSchema),
  userController.updateUserStatus
);

// DELETE /users/:id - Restore User (Admin only)
router.post(
  '/:id/restore',
  authorize([USER_ROLES.ADMIN]),
  userController.restoreUser
);

export default router;
