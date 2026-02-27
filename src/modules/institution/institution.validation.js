import { z } from 'zod';

// Create institution schema
export const createInstitutionSchema = z.object({
  name: z.string()
    .min(2, 'Institution name must be at least 2 characters')
    .max(200, 'Institution name must not exceed 200 characters'),

  email: z.string()
    .pipe(z.email('Invalid email address')),
});

// Update institution schema
export const updateInstitutionSchema = z.object({
  name: z.string()
    .min(2, 'Institution name must be at least 2 characters')
    .max(200, 'Institution name must not exceed 200 characters')
    .optional(),

  email: z.string()
    .pipe(z.email('Invalid email address'))
    .optional(),
});

// ID parameter schema
export const institutionIdSchema = z.object({
  id: z.string()
    .min(1, 'Institution ID is required'),
});
