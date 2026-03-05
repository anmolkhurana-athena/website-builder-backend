import UserDao from './user.dao.js';
import AuthDao from '../auth/auth.dao.js';
import { hashPassword, comparePassword } from '../../utils/password.util.js';
import cacheService from '../../services/cache.service.js';
import { generateAuthSessionKey } from '../../builders/redis-key.builder.js';
import { USER_ROLES } from '../../constants/user.constants.js';
import { is } from 'zod/v4/locales';

class UserService {
  constructor() {
    this.userDao = new UserDao();
    this.authDao = new AuthDao();
  }

  async getProfile(userId) {
    const user = await this.userDao.findUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  async updateOwnProfile(userId, data) {
    const user = await this.userDao.findUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    return await this.userDao.updateUser(userId, data);
  }

  async changePassword(userId, oldPassword, newPassword) {
    // Get user with password_hash
    const user = await this.userDao.findUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Verify old password by fetching with password
    const userWithPassword = await this.userDao.findUserById(userId, { include_password_hash: true });

    const isPasswordValid = await comparePassword(oldPassword, userWithPassword.password_hash);
    if (!isPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const password_hash = await hashPassword(newPassword);

    // Update password
    await this.userDao.updateUser(userId, { password_hash });

    return { message: 'Password changed successfully' };
  }

  async deactivateAccount(userId) {
    const user = await this.userDao.findUserById(userId);
    if (!user || !user.isActive) {
      throw new Error('User not found');
    }
    if (user.role === USER_ROLES.ADMIN) {
      throw new Error('Admin accounts cannot be deactivated');
    }
    await this.userDao.updateUser(userId, { isActive: false, deleted_at: new Date() });

    // Revoke all refresh tokens and sessions
    await this.authDao.revokeAllRefreshTokens(userId);

    const sessionKeyPattern = generateAuthSessionKey(userId, '*');
    await cacheService.clear(sessionKeyPattern);
  }

  async listUsers(filters) {
    return await this.userDao.listUsers(filters);
  }

  async getUserById(userId) {
    const user = await this.userDao.findUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  async updateUserRole(currentUser, userId, newRole) {
    const targetUser = await this.userDao.findUserById(userId);
    if (!targetUser) {
      throw new Error('User not found');
    }

    if (currentUser.id === userId) {
      throw new Error('You cannot change your own role');
    }

    if (targetUser.role === newRole) {
      throw new Error('User already has this role');
    }

    // Admin can change anyone's role to/from ADMIN
    return await this.userDao.updateUser(userId, { role: newRole });
  }

  async updateUserStatus(currentUser, userId, active) {
    const user = await this.userDao.findUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.id === currentUser.id) {
      throw new Error('You cannot update your own status');
    }

    if (user.isActive === active) {
      throw new Error('User status is already set to the requested value');
    }

    let updatedUser;

    if (active) {
      // If user is being reactivated, clear deleted_at timestamp
      updatedUser = await this.userDao.updateUser(userId, { isActive: true, deleted_at: null });
    }
    else {
      // If user is being suspended, set deleted_at timestamp and deactivate account
      updatedUser = await this.userDao.updateUser(userId, { isActive: false, deleted_at: new Date() });

      // If user is being suspended, revoke all their tokens and sessions
      await this.authDao.revokeAllRefreshTokens(userId);

      const sessionKeyPattern = generateAuthSessionKey(userId, '*');
      await cacheService.clear(sessionKeyPattern);
    }

    return updatedUser;
  }

  async restoreUser(currentUser, userId) {
    const user = await this.userDao.findUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    if (user.isActive) {
      throw new Error('User is already active');
    }

    // Cannot restore yourself
    if (currentUser.id === userId) {
      throw new Error('You cannot restore yourself');
    }

    return await this.userDao.updateUser(userId, { isActive: true, deleted_at: null });
  }
}

export default UserService;
