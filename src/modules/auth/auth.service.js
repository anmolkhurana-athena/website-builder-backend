import AuthDao from './auth.dao.js';
import { hashPassword, comparePassword } from '../../utils/password.util.js';
import { generateAccessToken } from '../../utils/jwt.util.js';
import emailService from '../../services/email.service.js';
import crypto from 'crypto';
import {
  PASSWORD_RESET_TOKEN_EXPIRY_HOURS,
  EMAIL_VERIFICATION_TOKEN_EXPIRY_HOURS,
} from '../../constants/auth.constants.js';
import { USER_ROLES } from '../../constants/user.constants.js';

class AuthService {
  constructor() {
    this.authDao = new AuthDao();
  }

  // Helper to generate random token
  _generateRandomToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  // Helper to hash token
  _hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  async register(data) {
    const { name, email, password, role } = data;

    // Check if user already exists
    const existingUser = await this.authDao.findUserByEmail(email);
    if (existingUser) {
      throw new Error('Email already exists');
    }

    // Hash password
    const password_hash = await hashPassword(password);

    // Prepare user data
    const userData = { name, email, password_hash, role };

    let user = await this.authDao.createUser(userData);

    // Generate email verification token
    const verificationToken = this._generateRandomToken();
    const tokenHash = this._hashToken(verificationToken);
    const expiresAt = new Date(Date.now() + EMAIL_VERIFICATION_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

    await this.authDao.createEmailVerificationToken({
      userId: user.id,
      token_hash: tokenHash,
      expiresAt,
    });

    // Send verification email
    await emailService.sendVerificationEmail(user.email, user.name, verificationToken);

    return {
      message: 'Registration successful. Please check your email to verify your account.',
    };
  }

  async login(data) {
    const { email, password } = data;

    // Find user by email
    const user = await this.authDao.findUserByEmail(email, { include_password_hash: true });
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Compare passwords
    const isPasswordValid = await comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Generate tokens
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(payload);

    const userWithoutPassword = { ...user };
    delete userWithoutPassword.password_hash;

    return {
      message: 'Login successful',
      accessToken,
      user: userWithoutPassword,
    };
  }

  async forgotPassword(data) {
    const { email } = data;

    // Find user by email
    const user = await this.authDao.findUserByEmail(email);

    // Always return success message even if user not found (security best practice)
    if (!user) {
      return {
        message: 'If an account with that email exists, a password reset link has been sent',
      };
    }

    // Generate password reset token
    const resetToken = this._generateRandomToken();
    const tokenHash = this._hashToken(resetToken);
    const expiresAt = new Date(Date.now() + PASSWORD_RESET_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

    await this.authDao.createPasswordResetToken({
      userId: user.id,
      token_hash: tokenHash,
      expiresAt,
      isUsed: false,
    });

    // Send password reset email
    await emailService.sendPasswordResetEmail(user.email, user.name, resetToken);

    return {
      message: 'If an account with that email exists, a password reset link has been sent',
    };
  }

  async resetPassword(data) {
    const { token, password } = data;

    // Hash the token to find it in database
    const tokenHash = this._hashToken(token);

    // Find the reset token
    const resetToken = await this.authDao.findPasswordResetToken(tokenHash);

    if (!resetToken) {
      throw new Error('Invalid or expired reset token');
    }

    // Hash new password
    const password_hash = await hashPassword(password);

    // Update user password and mark token as used
    await this.authDao.updateUserPassword(resetToken.userId, password_hash);
    await this.authDao.usePasswordResetToken(resetToken.id);

    return {
      message: 'Password reset successful. You can now login with your new password',
    };
  }

  async verifyEmail(token) {
    // Hash the token to find it in database
    const tokenHash = this._hashToken(token);

    // Find the verification token
    const verificationToken = await this.authDao.findEmailVerificationToken(tokenHash);

    if (!verificationToken) {
      throw new Error('Invalid or expired verification token');
    }

    // Mark user as verified
    await this.authDao.updateUser(verificationToken.userId, { isVerified: true });

    return {
      message: 'Email verified successfully',
    };
  }

  async cleanupExpiredTokens() {
    await this.authDao.deleteExpiredEmailVerificationTokens();
    await this.authDao.deleteExpiredPasswordResetTokens();
  }
}

export default AuthService;
