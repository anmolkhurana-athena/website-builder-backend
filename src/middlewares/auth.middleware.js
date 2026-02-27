import { verifyToken } from '../utils/jwt.util.js';
import prismaClient from '../config/prisma.js';
import { USER_ROLES } from '../constants/user.constants.js';
import { hasPermission } from '../constants/rbac.constants.js';

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
    const user = await prismaClient.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // verified and approved checks can be added here if needed in the future, as per business requirements

    // // Check if user is verified
    // if (!user.isVerified) {
    //   return res.status(403).json({ error: 'Please verify your email before logging in' });
    // }

    // // Check if user is approved
    // if (!user.isApproved) {
    //   return res.status(403).json({ error: 'Your account is pending approval' });
    // }

    // Attach user to request context
    req.user = user;
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
export const authorize = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized. Please login to continue' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'You do not have permission to access this resource' });
    }

    next();
  };
};

/**
 * Permission-based authorization middleware
 * Checks if the authenticated user has permission for a specific action on a resource
 */
export const checkPermission = (resource, action) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized. Please login to continue' });
    }

    if (!hasPermission(req.user.role, resource, action)) {
      return res.status(403).json({ error: 'You do not have permission to perform this action' });
    }

    next();
  };
};

/**
 * Institution-membership check middleware
 */
export const checkInstitutionMembership = () => {
  return async (req, res, next) => {
    try {
      const user = req.user;
      const institutionId = req.params.id;

      if (user.role !== USER_ROLES.SUPER_ADMIN && user.institutionId !== institutionId) {
        return res.status(403).json({ error: 'You do not have permission to access this institution resource' });
      }

      next();
    } catch (error) {
      console.error('Institution membership check error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
};