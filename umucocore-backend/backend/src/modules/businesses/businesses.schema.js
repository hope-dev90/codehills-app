import { z } from 'zod';

const BUSINESS_CATEGORIES = ['Handicrafts', 'Food & Drinks', 'Art', 'Tourism experience', 'Other'];

export const saveBusinessSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(120),
    category: z.enum(BUSINESS_CATEGORIES),
    description: z.string().min(10).max(2000),
    imageUrl: z.string().url().optional().nullable(),
  }),
});
