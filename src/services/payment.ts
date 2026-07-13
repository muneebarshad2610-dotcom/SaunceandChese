export interface PaymentResult {
  success: boolean;
  transactionId: string;
  message: string;
}

export interface PaymentGateway {
  name: string;
  charge(amount: number, currency: string): Promise<PaymentResult>;
}

class MockPaymentGateway implements PaymentGateway {
  name = 'mock';

  async charge(amount: number, currency: string): Promise<PaymentResult> {
    await new Promise((r) => setTimeout(r, 2000 + Math.random() * 1000));
    if (Math.random() < 0.05) {
      return { success: false, transactionId: '', message: 'Payment declined. Please try again.' };
    }
    return {
      success: true,
      transactionId: 'MOCK-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).slice(2, 6).toUpperCase(),
      message: `Payment of ${currency} ${amount.toLocaleString()} successful`,
    };
  }
}

class StripePaymentGateway implements PaymentGateway {
  name = 'stripe';
  async charge(_amount: number, _currency: string): Promise<PaymentResult> {
    throw new Error('Stripe not configured. Use PAYMENT_GATEWAY=mock for development.');
  }
}

export function getPaymentGateway(): PaymentGateway {
  const gateway = import.meta.env.VITE_PAYMENT_GATEWAY || 'mock';
  switch (gateway) {
    case 'stripe':
      return new StripePaymentGateway();
    default:
      return new MockPaymentGateway();
  }
}
