import express from 'express';
import UserController from './user.controller.js';
import { authenticate, checkPermission } from '../../middlewares/auth.middleware.js';
import { validateRequest } from '../../middlewares/validation.middleware.js';
import {
  updateOwnProfileSchema,
  changePasswordSchema,
  updateUserSchema,
  listUsersQuerySchema,
} from './user.validation.js';

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
router.patch(
  '/me/change-password',
  validateRequest(changePasswordSchema),
  userController.changePassword
);

// GET /users - List users (Institution Admin: own institution, Super Admin: all)
router.get(
  '/',
  checkPermission('USER', 'viewInstitution'), // Will check viewInstitution or viewAll
  userController.listUsers
);

// GET /users/:id - Get user by ID
router.get('/:id', userController.getUserById);

// PUT /users/:id - Update user (Institution Admin, Super Admin)
router.put(
  '/:id',
  checkPermission('USER', 'update'),
  validateRequest(updateUserSchema),
  userController.updateUser
);

// PATCH /users/:id/approve - Approve user
router.patch(
  '/:id/approve',
  checkPermission('USER', 'approve'),
  userController.approveUser
);

// PATCH /users/:id/block - Block/unblock user
router.patch(
  '/:id/block',
  checkPermission('USER', 'block'),
  userController.blockUser
);

// DELETE /users/:id - Delete user (Super Admin only)
router.delete(
  '/:id',
  checkPermission('USER', 'delete'),
  userController.deleteUser
);

export default router;
