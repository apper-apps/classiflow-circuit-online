const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class PaymentService {
  constructor() {
    this.apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
  }

  async createPaymentIntent(paymentData) {
    await delay(300);
    
    // In a real implementation, this would call your backend API
    // which would create a payment intent with Stripe
    try {
      // Mock successful payment intent creation
      const response = {
        clientSecret: `pi_mock_${Date.now()}_secret_mock${Math.random().toString(36).substr(2, 9)}`,
        id: `pi_mock_${Date.now()}`,
        amount: paymentData.amount,
        currency: paymentData.currency,
        status: 'requires_payment_method'
      };

      return response;
    } catch (error) {
      throw new Error('Failed to create payment intent');
    }
  }

  async confirmPayment(paymentIntentId, paymentMethodId) {
    await delay(500);
    
    // Mock payment confirmation
    try {
      const response = {
        id: paymentIntentId,
        status: 'succeeded',
        amount_received: 3500, // Example amount in cents
        currency: 'usd',
        created: Math.floor(Date.now() / 1000)
      };

      return response;
    } catch (error) {
      throw new Error('Payment confirmation failed');
    }
  }

  async getPaymentIntent(paymentIntentId) {
    await delay(200);
    
    try {
      const response = {
        id: paymentIntentId,
        status: 'succeeded',
        amount: 3500,
        currency: 'usd',
        created: Math.floor(Date.now() / 1000)
      };

      return response;
    } catch (error) {
      throw new Error('Failed to retrieve payment intent');
    }
  }

  async processRefund(paymentIntentId, amount) {
    await delay(400);
    
    try {
      const response = {
        id: `re_${Date.now()}`,
        amount: amount,
        currency: 'usd',
        status: 'succeeded',
        payment_intent: paymentIntentId
      };

      return response;
    } catch (error) {
      throw new Error('Refund processing failed');
    }
  }

  // Webhook handler for Stripe events (would be implemented on backend)
  async handleWebhook(event) {
    await delay(100);
    
    switch (event.type) {
      case 'payment_intent.succeeded':
        // Handle successful payment
        return { received: true };
      case 'payment_intent.payment_failed':
        // Handle failed payment
        return { received: true };
      default:
        return { received: false };
    }
  }
}

export default new PaymentService();