import { Payment, CreatePaymentDto, UpdatePaymentDto, ReservationPaymentSummary } from '../types/payment';

const API_BASE_URL = 'http://localhost:5184/api/payments';

export const paymentApi = {
  async getPayments(
    propertyId?: number, 
    reservationId?: number,
    startDate?: string,
    endDate?: string
  ): Promise<Payment[]> {
    const params = new URLSearchParams();
    if (propertyId) params.append('propertyId', propertyId.toString());
    if (reservationId) params.append('reservationId', reservationId.toString());
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const res = await fetch(`${API_BASE_URL}?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch payments');
    return res.json();
  },

  async getPaymentById(id: number): Promise<Payment> {
    const res = await fetch(`${API_BASE_URL}/${id}`);
    if (!res.ok) throw new Error(`Failed to fetch payment #${id}`);
    return res.json();
  },

  async getReservationSummary(reservationId: number): Promise<ReservationPaymentSummary> {
    const res = await fetch(`${API_BASE_URL}/reservation/${reservationId}/summary`);
    if (!res.ok) throw new Error(`Failed to fetch payment summary for reservation #${reservationId}`);
    return res.json();
  },

  async createPayment(dto: CreatePaymentDto): Promise<Payment> {
    const res = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to record payment');
    }

    return res.json();
  },

  async updatePayment(id: number, dto: UpdatePaymentDto): Promise<Payment> {
    const res = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to update payment');
    }

    return res.json();
  },

  async deletePayment(id: number): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to delete payment');
    }
  },
};
