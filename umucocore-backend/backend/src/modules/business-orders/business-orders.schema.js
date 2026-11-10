import { z } from 'zod';

export const updateStatusSchema = z.object({
  body: z.object({
    status: z.enum(['New', 'Preparing', 'Delivered']),
  }),
});
