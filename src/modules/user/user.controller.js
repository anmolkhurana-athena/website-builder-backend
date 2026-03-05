import UserService from './user.service.js';

class UserController {
  constructor() {
    this.userService = new UserService();
  }

  // GET /users/me - Get current user profile
  getProfile = async (req, res) => {
    try {
      const user = await this.userService.getProfile(req.user.id);
      res.status(200).json({ user });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(400).json({ error: error.message });
    }
  };

  // PUT /users/me - Update own profile
  updateOwnProfile = async (req, res) => {
    try {
      const user = await this.userService.updateOwnProfile(req.user.id, req.validated.body);
      res.status(200).json({ message: 'Profile updated successfully', user });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(400).json({ error: error.message });
    }
  };

  // PATCH /users/me/change-password - Change own password
  changePassword = async (req, res) => {
    try {
      const { oldPassword, newPassword } = req.validated.body;
      const result = await this.userService.changePassword(req.user.id, oldPassword, newPassword);
      res.status(200).json(result);
    } catch (error) {
      console.error('Change password error:', error);
      res.status(400).json({ error: error.message });
    }
  };

  // DELETE /users/me - Deactivate own account
  deactivateAccount = async (req, res) => {
    try {
      await this.userService.deactivateAccount(req.user.id);
      res.status(200).json({ message: 'Account deactivated successfully' });
    } catch (error) {
      console.error('Deactivate account error:', error);
      res.status(400).json({ error: error.message });
    }
  };

  // GET /users - List users
  listUsers = async (req, res) => {
    try {
      console.log('List users filters:', req.validated.query);
      const result = await this.userService.listUsers(req.validated.query);
      res.status(200).json(result);
    } catch (error) {
      console.error('List users error:', error);
      res.status(403).json({ error: error.message });
    }
  };

  // GET /users/:id - Get user by ID
  getUserById = async (req, res) => {
    try {
      const user = await this.userService.getUserById(req.params.id);
      res.status(200).json({ user });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(error.message === 'User not found' ? 404 : 403).json({ error: error.message });
    }
  };

  // PATCH /users/:id/role - Update user role
  updateUserRole = async (req, res) => {
    try {
      const user = await this.userService.updateUserRole(req.user, req.params.id, req.validated.body.role);
      res.status(200).json({ message: 'User role updated successfully', user });
    } catch (error) {
      console.error('Update user role error:', error);
      res.status(error.message === 'User not found' ? 404 : 403).json({ error: error.message });
    }
  };

  // PATCH /users/:id/status - Suspend/Reactivate user
  updateUserStatus = async (req, res) => {
    try {
      const active = req.validated.body.active;
      const user = await this.userService.updateUserStatus(req.user, req.params.id, active);
      res.status(200).json({
        message: active ? 'User reactivated successfully' : 'User suspended successfully',
        user
      });
    } catch (error) {
      console.error('Update user status error:', error);
      res.status(error.message === 'User not found' ? 404 : 403).json({ error: error.message });
    }
  };

  // DELETE /users/:id - Restore user
  restoreUser = async (req, res) => {
    try {
      await this.userService.restoreUser(req.user, req.params.id);
      res.status(200).json({ message: 'User restored successfully' });
    } catch (error) {
      console.error('Restore user error:', error);
      res.status(error.message === 'User not found' ? 404 : 403).json({ error: error.message });
    }
  };
}

export default UserController;
