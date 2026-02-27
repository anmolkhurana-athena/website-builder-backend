import express from 'express';
import AuthController from './auth.controller.js';
import { validateRequest } from '../../middlewares/validation.middleware.js';

import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  emailVerificationSchema,
} from './auth.validation.js';

const router = express.Router();
const authController = new AuthController();

// POST /auth/register - Register a new user
router.post(
  '/register',
  validateRequest(registerSchema),
  authController.register
);

// POST /auth/login - Login user
router.post(
  '/login',
  validateRequest(loginSchema),
  authController.login
);

// GET /auth/logout - Logout user
router.get(
  '/logout',
  authController.logout
);

// POST /auth/forgot-password - Request password reset
router.post(
  '/forgot-password',
  validateRequest(forgotPasswordSchema),
  authController.forgotPassword
);

// POST /auth/reset-password - Reset password with token
router.post(
  '/reset-password',
  validateRequest(resetPasswordSchema),
  authController.resetPassword
);

// GET /auth/email-verification - Verify email with token
router.get(
  '/email-verification',
  validateRequest(emailVerificationSchema, 'query'),
  authController.verifyEmail
);

export default router;
