import AuthService from '../modules/auth/auth.service.js';

class CleanupService {
  constructor() {
    this.authService = new AuthService();
  }

  // Method to clean up expired tokens
  // can be scheduled to run periodically using a scheduler (like node-cron)
  async cleanupExpiredTokens() {
    await this.authService.cleanupExpiredTokens();
  }
}

export default CleanupService;