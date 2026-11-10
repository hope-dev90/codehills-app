import { z } from 'zod';

export const createOrderSchema = z.object({
  body: z.object({
    lines: z
      .array(
        z.object({
          productId: z.string().min(1),
          quantity: z.number().int().min(1).max(99),
        }),
      )
      .min(1, 'Order must have at least one item'),
    delivery: z.object({
      fullName: z.string().min(2),
      phone: z.string().min(8),
      address: z.string().min(4),
      city: z.string().min(2),
    }),
    paymentMethod: z
      .enum(['cash_on_delivery', 'mtn_momo', 'airtel_money', 'card'])
      .default('cash_on_delivery'),
  }),
});

export const updateStatusSchema = z.object({
  body: z.object({
    status: z.enum(['placed', 'preparing', 'shipped', 'delivered', 'cancelled']).optional(),
    paymentStatus: z.enum(['unpaid', 'pending', 'paid', 'failed']).optional(),
  }),
});
