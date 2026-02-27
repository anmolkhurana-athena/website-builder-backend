import { USER_ROLES } from './user.constants.js';

/**
 * RBAC Permissions Structure:
 * - viewAll: View all records across all institutions
 * - viewInstitution: View records within own institution only
 * - viewOwn: View only own records
 * - update/updateOwn: Update records
 * - approve: Approve users/institutions
 * - block: Block/unblock users/institutions
 */

export const USER_PERMISSIONS = {
  viewAll: [USER_ROLES.SUPER_ADMIN],
  viewInstitution: [USER_ROLES.INSTITUTION_ADMIN],

  update: [USER_ROLES.INSTITUTION_ADMIN, USER_ROLES.SUPER_ADMIN],

  approve: [USER_ROLES.INSTITUTION_ADMIN, USER_ROLES.SUPER_ADMIN],
  block: [USER_ROLES.INSTITUTION_ADMIN, USER_ROLES.SUPER_ADMIN],
  delete: [USER_ROLES.SUPER_ADMIN],
};

export const INSTITUTION_PERMISSIONS = {
  viewAll: [USER_ROLES.SUPER_ADMIN],
  viewOwn: [USER_ROLES.INSTITUTION_ADMIN],

  updateOwn: [USER_ROLES.INSTITUTION_ADMIN],
  update: [USER_ROLES.SUPER_ADMIN],

  approve: [USER_ROLES.SUPER_ADMIN],
  block: [USER_ROLES.SUPER_ADMIN],
  delete: [USER_ROLES.SUPER_ADMIN],
};

export const WEBSITE_PERMISSIONS = {
  viewAll: [USER_ROLES.SUPER_ADMIN],
  viewInstitution: [USER_ROLES.INSTITUTION_ADMIN],

  delete: [USER_ROLES.SUPER_ADMIN],
};

/**
 * Helper function to check if user has permission
 */
export const hasPermission = (role, resource, action) => {
  const permissions = {
    USER: USER_PERMISSIONS,
    INSTITUTION: INSTITUTION_PERMISSIONS,
    WEBSITE: WEBSITE_PERMISSIONS,
  };

  return permissions[resource]?.[action]?.includes(role) || false;
};