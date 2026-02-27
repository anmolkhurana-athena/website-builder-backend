import express from 'express';
import InstitutionController from './institution.controller.js';
import { validateRequest } from '../../middlewares/validation.middleware.js';
import { authenticate, authorize, checkInstitutionMembership } from '../../middlewares/auth.middleware.js';
import {
  createInstitutionSchema,
  updateInstitutionSchema
} from './institution.validation.js';
import { INSTITUTION_PERMISSIONS } from '../../constants/rbac.constants.js';

const router = express.Router();
const institutionController = new InstitutionController();

// POST /institutions - Create a new institution
router.post(
  '/',
  authenticate,
  authorize(INSTITUTION_PERMISSIONS.create),
  validateRequest(createInstitutionSchema),
  institutionController.createInstitution
);

// GET /institutions - Get all institutions
router.get(
  '/',
  authenticate,
  authorize(INSTITUTION_PERMISSIONS.viewAll),
  institutionController.getAllInstitutions
);

// GET /institutions/:id - Get institution by ID
router.get(
  '/:id',
  authenticate,
  authorize(INSTITUTION_PERMISSIONS.viewOwn),
  checkInstitutionMembership,
  institutionController.getInstitutionById
);

// PUT /institutions/:id - Update institution
router.put(
  '/:id',
  authenticate,
  authorize(INSTITUTION_PERMISSIONS.edit),
  checkInstitutionMembership,
  validateRequest(updateInstitutionSchema),
  institutionController.updateInstitution
);

// PATCH /institutions/:id/approve - Approve institution
router.patch(
  '/:id/approve',
  authenticate,
  authorize(INSTITUTION_PERMISSIONS.approve),
  institutionController.approveInstitution
);

// PATCH /institutions/:id/block - Block institution
router.patch(
  '/:id/block',
  authenticate,
  authorize(INSTITUTION_PERMISSIONS.block),
  institutionController.blockInstitution
);

// DELETE /institutions/:id - Delete institution
router.delete(
  '/:id',
  authenticate,
  authorize(INSTITUTION_PERMISSIONS.delete),
  institutionController.deleteInstitution
);

export default router;
