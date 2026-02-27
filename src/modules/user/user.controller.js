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
      const user = await this.userService.updateOwnProfile(req.user.id, req.body);
      res.status(200).json({ message: 'Profile updated successfully', user });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(400).json({ error: error.message });
    }
  };

  // PATCH /users/me/change-password - Change own password
  changePassword = async (req, res) => {
    try {
      const { oldPassword, newPassword } = req.body;
      const result = await this.userService.changePassword(req.user.id, oldPassword, newPassword);
      res.status(200).json(result);
    } catch (error) {
      console.error('Change password error:', error);
      res.status(400).json({ error: error.message });
    }
  };

  // GET /users - List users
  listUsers = async (req, res) => {
    try {
      const result = await this.userService.listUsers(req.user, req.query);
      res.status(200).json(result);
    } catch (error) {
      console.error('List users error:', error);
      res.status(403).json({ error: error.message });
    }
  };

  // GET /users/:id - Get user by ID
  getUserById = async (req, res) => {
    try {
      const user = await this.userService.getUserById(req.user, req.params.id);
      res.status(200).json({ user });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(error.message === 'User not found' ? 404 : 403).json({ error: error.message });
    }
  };

  // PUT /users/:id - Update user
  updateUser = async (req, res) => {
    try {
      const user = await this.userService.updateUser(req.user, req.params.id, req.body);
      res.status(200).json({ message: 'User updated successfully', user });
    } catch (error) {
      console.error('Update user error:', error);
      res.status(error.message === 'User not found' ? 404 : 403).json({ error: error.message });
    }
  };

  // PATCH /users/:id/approve - Approve user
  approveUser = async (req, res) => {
    try {
      const user = await this.userService.approveUser(req.user, req.params.id);
      res.status(200).json({ message: 'User approved successfully', user });
    } catch (error) {
      console.error('Approve user error:', error);
      res.status(error.message === 'User not found' ? 404 : 403).json({ error: error.message });
    }
  };

  // PATCH /users/:id/block - Block/unblock user
  blockUser = async (req, res) => {
    try {
      const block = req.body.block !== false; // Default to true
      const user = await this.userService.blockUser(req.user, req.params.id, block);
      res.status(200).json({
        message: block ? 'User blocked successfully' : 'User unblocked successfully',
        user
      });
    } catch (error) {
      console.error('Block user error:', error);
      res.status(error.message === 'User not found' ? 404 : 403).json({ error: error.message });
    }
  };

  // DELETE /users/:id - Delete user
  deleteUser = async (req, res) => {
    try {
      await this.userService.deleteUser(req.user, req.params.id);
      res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(error.message === 'User not found' ? 404 : 403).json({ error: error.message });
    }
  };
}

export default UserController;
