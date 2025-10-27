import { apiRequest } from '@/lib/api-config';

export interface PaymentInitiateRequest {
  bookingId: string;
  amount: number;
  type: 'equipment-package' | 'custom-equipment-package' | 'equipment' | 'artist';
  description?: string;
  customerMobile?: string;
}

export interface PaymentInitiateResponse {
  paymentLink: string;
  trackId: string;
  bookingId: string;
  type: string;
}

export interface PaymentVerifyRequest {
  bookingId: string;
  type: string;
  trackId: string;
  sessionId?: string;
  invoiceId?: string;
  cancelled?: boolean;
}

export interface PaymentVerifyResponse {
  message: string;
  success: boolean;
}

export class PaymentService {
  static async initiatePayment(data: PaymentInitiateRequest): Promise<PaymentInitiateResponse> {
    return apiRequest('/payment/initiate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async verifyPayment(data: PaymentVerifyRequest): Promise<PaymentVerifyResponse> {
    const params = new URLSearchParams();
    params.append('bookingId', data.bookingId);
    params.append('type', data.type);
    if (data.trackId) params.append('trackId', data.trackId);
    
    if (data.sessionId) {
      params.append('sessionId', data.sessionId);
    }
    
    if (data.invoiceId) {
      params.append('invoiceId', data.invoiceId);
    }

    if (data.cancelled) {
      params.append('cancelled', '1');
    }

    return apiRequest(`/payment/verify?${params.toString()}`, {
      method: 'GET',
    });
  }

  // Helper method to redirect to payment gateway
  static redirectToPayment(paymentLink: string): void {
    if (typeof window !== 'undefined') {
      console.log('Attempting to redirect to:', paymentLink);
      
      // Validate the payment link
      if (!paymentLink || !paymentLink.startsWith('http')) {
        console.error('Invalid payment link:', paymentLink);
        throw new Error('Invalid payment link received');
      }
      
      // Use window.open for better control and fallback
      try {
        const newWindow = window.open(paymentLink, '_self');
        if (!newWindow) {
          // Fallback to location.href if popup is blocked
          window.location.href = paymentLink;
        }
      } catch (error) {
        console.error('Error redirecting to payment:', error);
        // Final fallback
        window.location.href = paymentLink;
      }
    } else {
      console.error('Window object not available for redirect');
    }
  }

  // Helper method to get payment callback parameters from URL
  static getPaymentCallbackParams(): Record<string, string> {
    if (typeof window === 'undefined') return {};
    
    const urlParams = new URLSearchParams(window.location.search);
    const params: Record<string, string> = {};
    
    for (const [key, value] of urlParams.entries()) {
      params[key] = value;
    }
    
    return params;
  }
}