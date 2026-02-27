import UserDao from './user.dao.js';
import { hashPassword, comparePassword } from '../../utils/password.util.js';
import { USER_ROLES } from '../../constants/user.constants.js';

class UserService {
  constructor() {
    this.userDao = new UserDao();
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

  async listUsers(currentUser, filters) {
    // Super Admin can view all users
    if (currentUser.role === USER_ROLES.SUPER_ADMIN) {
      return await this.userDao.listUsers(filters);
    }

    // Institution Admin can only view users in their institution
    if (currentUser.role === USER_ROLES.INSTITUTION_ADMIN) {
      if (!currentUser.institution_id) {
        throw new Error('Institution admin does not have an associated institution');
      }
      filters.institution_id = currentUser.institution_id;
      return await this.userDao.listUsers(filters);
    }

    throw new Error('Unauthorized to list users');
  }

  async getUserById(currentUser, userId) {
    const user = await this.userDao.findUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Super Admin can view anyone
    if (currentUser.role === USER_ROLES.SUPER_ADMIN) {
      return user;
    }

    // Institution Admin can view users in their institution
    if (currentUser.role === USER_ROLES.INSTITUTION_ADMIN) {
      if (user.institution_id !== currentUser.institution_id) {
        throw new Error('You can only view users in your institution');
      }
      return user;
    }

    // Users can only view their own profile
    if (currentUser.id === userId) {
      return user;
    }

    throw new Error('Unauthorized to view this user');
  }

  async updateUser(currentUser, userId, data) {
    const user = await this.userDao.findUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Super Admin can update anyone
    if (currentUser.role === USER_ROLES.SUPER_ADMIN) {
      // Super Admin cannot change role to/from SUPER_ADMIN
      // if either role from or to is SUPER_ADMIN but not both, throw error
      if (data.role === USER_ROLES.SUPER_ADMIN ^ user.role === USER_ROLES.SUPER_ADMIN) {
        throw new Error('Cannot modify super admin role');
      }
      return await this.userDao.updateUser(userId, data);
    }

    // Institution Admin can update users in their institution
    if (currentUser.role === USER_ROLES.INSTITUTION_ADMIN) {
      if (user.institution_id !== currentUser.institution_id) {
        throw new Error('You can only update users in your institution');
      }

      // Institution Admin cannot change roles to INSTITUTION_ADMIN or SUPER_ADMIN
      if (data.role && data.role !== user.role) {
        throw new Error('You cannot change user roles');
      }

      return await this.userDao.updateUser(userId, data);
    }

    throw new Error('Unauthorized to update this user');
  }

  async approveUser(currentUser, userId) {
    const user = await this.userDao.findUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.id === currentUser.id) {
      throw new Error('You cannot approve yourself');
    }

    // Super Admin can approve anyone
    if (currentUser.role === USER_ROLES.SUPER_ADMIN) {
      return await this.userDao.approveUser(userId);
    }

    // Institution Admin can approve STUDENT in their institution
    if (currentUser.role === USER_ROLES.INSTITUTION_ADMIN) {
      if (user.institution_id !== currentUser.institution_id) {
        throw new Error('You can only approve users in your institution');
      }

      if (user.role !== USER_ROLES.STUDENT) {
        throw new Error('You can only approve students');
      }

      return await this.userDao.approveUser(userId);
    }

    throw new Error('Unauthorized to approve this user');
  }

  async blockUser(currentUser, userId, block = true) {
    const user = await this.userDao.findUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Cannot block yourself
    if (currentUser.id === userId) {
      throw new Error('You cannot block yourself');
    }

    // Super Admin can block anyone except other SUPER_ADMIN
    if (currentUser.role === USER_ROLES.SUPER_ADMIN) {
      if (user.role === USER_ROLES.SUPER_ADMIN) {
        throw new Error('Cannot block super admin');
      }
      return await this.userDao.blockUser(userId, block);
    }

    // Institution Admin can block users in their institution
    if (currentUser.role === USER_ROLES.INSTITUTION_ADMIN) {
      if (user.institution_id !== currentUser.institution_id) {
        throw new Error('You can only block users in your institution');
      }
      if (user.role === USER_ROLES.INSTITUTION_ADMIN) {
        throw new Error('You cannot block other institution admins');
      }
      return await this.userDao.blockUser(userId, block);
    }

    throw new Error('Unauthorized to block this user');
  }

  async deleteUser(currentUser, userId) {
    const user = await this.userDao.findUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Only Super Admin can delete
    if (currentUser.role !== USER_ROLES.SUPER_ADMIN) {
      throw new Error('Only super admin can delete users');
    }

    // Cannot delete yourself
    if (currentUser.id === userId) {
      throw new Error('You cannot delete yourself');
    }

    // Cannot delete other SUPER_ADMIN
    if (user.role === USER_ROLES.SUPER_ADMIN) {
      throw new Error('Cannot delete super admin');
    }

    return await this.userDao.deleteUser(userId);
  }
}

export default UserService;
