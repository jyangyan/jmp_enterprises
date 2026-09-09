import { Receipt, CreateReceiptInput, CheckoutSettlementInput } from '../types/receipt';

const API_BASE_URL = 'http://localhost:5184/api';

export const receiptApi = {
  async getReceipts(reservationId?: number, paymentId?: number): Promise<Receipt[]> {
    const params = new URLSearchParams();
    if (reservationId) params.append('reservationId', reservationId.toString());
    if (paymentId) params.append('paymentId', paymentId.toString());

    const res = await fetch(`${API_BASE_URL}/receipts?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch receipts');
    return res.json();
  },

  async getReceiptById(id: number): Promise<Receipt> {
    const res = await fetch(`${API_BASE_URL}/receipts/${id}`);
    if (!res.ok) throw new Error(`Failed to fetch receipt #${id}`);
    return res.json();
  },

  async getReservationReceipts(reservationId: number): Promise<Receipt[]> {
    const res = await fetch(`${API_BASE_URL}/reservations/${reservationId}/receipts`);
    if (!res.ok) throw new Error(`Failed to fetch receipts for reservation #${reservationId}`);
    return res.json();
  },

  async getPaymentReceipt(paymentId: number): Promise<Receipt | null> {
    const res = await fetch(`${API_BASE_URL}/payments/${paymentId}/receipt`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Failed to fetch receipt for payment #${paymentId}`);
    return res.json();
  },

  async createReceipt(input: CreateReceiptInput): Promise<Receipt> {
    const res = await fetch(`${API_BASE_URL}/receipts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to generate receipt');
    }

    return res.json();
  },

  async createCheckoutReceipt(input: CheckoutSettlementInput): Promise<Receipt> {
    const res = await fetch(`${API_BASE_URL}/receipts/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to generate checkout receipt');
    }

    return res.json();
  },

  async voidReceipt(id: number): Promise<Receipt> {
    const res = await fetch(`${API_BASE_URL}/receipts/${id}/void`, {
      method: 'POST',
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to void receipt');
    }

    return res.json();
  },
};
