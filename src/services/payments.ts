import type { PaymentService } from './interfaces';

/**
 * DEMO payment service. It NEVER charges anything and never reports a payment as completed.
 * A real provider (mobile money, card, ...) must implement `PaymentService` and return
 * `status: 'paid'` only after the provider confirms the transaction.
 */
export const paymentService: PaymentService = {
  async pay(_amountRwf, orderId) {
    return { status: 'demo_no_payment', verified: false, reference: `demo-${orderId}` };
  },
};
