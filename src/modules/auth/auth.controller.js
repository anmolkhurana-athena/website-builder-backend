import AuthService from './auth.service.js';
import { ACCESS_TOKEN_EXPIRY_MS, COOKIE_OPTIONS } from '../../constants/auth.constants.js';

class AuthController {
  constructor() {
    this.authService = new AuthService();
  }

  register = async (req, res) => {
    try {
      const result = await this.authService.register(req.body);
      res.status(201).json(result);
    } catch (error) {
      console.error('Register error:', error);
      res.status(400).json({ error: error.message });
    }
  };

  login = async (req, res) => {
    try {
      const result = await this.authService.login(req.body);

      // Set access token in http-only cookie
      res.cookie('accessToken', result.accessToken, {
        ...COOKIE_OPTIONS,
        maxAge: ACCESS_TOKEN_EXPIRY_MS
      });

      res.status(200).json({
        message: result.message,
        user: result.user,
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(401).json({ error: error.message });
    }
  };

  logout = async (req, res) => {
    try {
      // Clear cookies
      res.clearCookie('accessToken');

      res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ error: error.message });
    }
  };

  forgotPassword = async (req, res) => {
    try {
      const result = await this.authService.forgotPassword(req.body);
      res.status(200).json(result);
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({ error: error.message });
    }
  };

  resetPassword = async (req, res) => {
    try {
      const result = await this.authService.resetPassword(req.body);
      res.status(200).json(result);
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(400).json({ error: error.message });
    }
  };

  verifyEmail = async (req, res) => {
    try {
      const { token } = req.query;
      const result = await this.authService.verifyEmail(token);
      res.status(200).json(result);
    } catch (error) {
      console.error('Email verification error:', error);
      res.status(400).json({ error: error.message });
    }
  };
}

export default AuthController;
