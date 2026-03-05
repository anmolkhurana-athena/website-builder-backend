import { verifyToken } from '../utils/jwt.util.js';
import cacheService from '../services/cache.service.js';
import { generateAuthSessionKey } from '../builders/redis-key.builder.js';
import { USER_ROLES } from '../constants/user.constants.js';

/**
 * Authentication middleware
 * Verifies access token from cookies and attaches user to request
 */
export const authenticate = async (req, res, next) => {
  try {
    // Get access token from cookies
    const token = req.cookies?.accessToken;

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized. Please login to continue' });
    }

    // Verify token
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (error) {
      return res.status(401).json({ error: 'Unauthorized. Please login to continue' });
    }

    // Fetch user profile from database
    const sessionId = decoded.sessionId;
    const sessionKey = generateAuthSessionKey(decoded.userId, sessionId);
    const sessionData = await cacheService.get(sessionKey);

    if (!sessionData) {
      return res.status(401).json({ error: 'Session expired. Please login again' });
    }

    const user = {
      id: decoded.userId,
      role: decoded.role,
      refreshTokenId: decoded.refreshTokenId,
    };

    // verified check can be added here if needed in the future, as per business requirements

    // // Check if user is verified
    // if (!user.isVerified) {
    //   return res.status(403).json({ error: 'Please verify your email before logging in' });
    // }

    // Attach user to request context
    req.user = user;
    req.sessionId = sessionId;

    next();

  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Role-based authorization middleware
 * Checks if the authenticated user has the required role(s)
 */
export const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized. Please login to continue' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'You do not have permission to access this resource' });
    }

    next();
  };
};