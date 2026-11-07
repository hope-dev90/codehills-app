import { z } from 'zod';

export const addItemSchema = z.object({
  body: z.object({
    productId: z.string().min(1),
    quantity: z.number().int().min(1).max(99).default(1),
  }),
});

export const updateItemSchema = z.object({
  body: z.object({
    quantity: z.number().int().min(0).max(99),
  }),
});
