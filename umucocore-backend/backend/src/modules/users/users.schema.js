import { z } from 'zod';

export const updateProfileSchema = z.object({
  body: z.object({
    fullName: z.string().min(2).max(120).optional(),
    language: z.enum(['en', 'rw', 'fr']).optional(),
    rememberMe: z.boolean().optional(),
  }),
});
