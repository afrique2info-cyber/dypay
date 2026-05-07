/**
 * Dypay JavaScript/Node.js SDK Type Definitions
 * @version 1.0.0
 */

export interface PaymentParams {
  amount: number;
  currency: 'XAF' | 'XOF' | 'CDF' | 'UGX' | 'LRD' | 'GNF';
  item_ref: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  return_url?: string;
  notify_url?: string;
  metadata?: Record<string, any>;
}

export interface Payment {
  id: string;
  payment_ref: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  item_ref: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  payment_url: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface PaymentListResponse {
  data: Payment[];
  total: number;
  limit: number;
  offset: number;
}

export interface PaymentFilters {
  status?: 'pending' | 'completed' | 'failed' | 'cancelled';
  limit?: number;
  offset?: number;
}

export interface WebhookEvent {
  event: string;
  payment_ref: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  amount: number;
  currency: string;
  metadata: Record<string, any>;
  timestamp: string;
}

export default class DypayClient {
  static readonly VERSION: string;
  static readonly SUPPORTED_CURRENCIES: string[];
  static readonly PAYMENT_STATUS: {
    PENDING: 'pending';
    COMPLETED: 'completed';
    FAILED: 'failed';
    CANCELLED: 'cancelled';
  };

  constructor(apiKey: string, apiSecret: string, isLive?: boolean);

  createPayment(params: PaymentParams): Promise<Payment>;
  getPayment(paymentRef: string): Promise<Payment>;
  listPayments(filters?: PaymentFilters): Promise<PaymentListResponse>;
  verifyWebhookSignature(payload: string, signature: string): boolean;
  handleWebhook(payload: string, signature: string): WebhookEvent;
  setBaseUrl(baseUrl: string): void;

  get live(): boolean;
}
