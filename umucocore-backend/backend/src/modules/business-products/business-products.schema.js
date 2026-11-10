import { z } from 'zod';

export const addProductSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(120),
    priceRwf: z.number().int().min(0),
  }),
});

export const updateProductSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(120).optional(),
    priceRwf: z.number().int().min(0).optional(),
    isActive: z.boolean().optional(),
  }),
});
