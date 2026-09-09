import { Reservation, CreateReservationDto, UpdateReservationDto, PropertyAvailability } from '../types/reservation';

const API_BASE_URL = 'http://localhost:5184/api/reservations';

export const reservationApi = {
  async getReservations(
    propertyId?: number, 
    rentalType?: string, 
    status?: string
  ): Promise<Reservation[]> {
    const params = new URLSearchParams();
    if (propertyId) params.append('propertyId', propertyId.toString());
    if (rentalType && rentalType !== 'All') params.append('rentalType', rentalType);
    if (status && status !== 'All') params.append('status', status);

    const res = await fetch(`${API_BASE_URL}?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch reservations');
    return res.json();
  },

  async getReservationById(id: number): Promise<Reservation> {
    const res = await fetch(`${API_BASE_URL}/${id}`);
    if (!res.ok) throw new Error(`Failed to fetch reservation #${id}`);
    return res.json();
  },

  async checkAvailability(checkIn: string, checkOut: string): Promise<PropertyAvailability[]> {
    const res = await fetch(`${API_BASE_URL}/availability?checkIn=${checkIn}&checkOut=${checkOut}`);
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to check availability');
    }
    return res.json();
  },

  async createReservation(dto: CreateReservationDto): Promise<Reservation> {
    const res = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to create reservation');
    }

    return res.json();
  },

  async updateReservation(id: number, dto: UpdateReservationDto): Promise<Reservation> {
    const res = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to update reservation');
    }

    return res.json();
  },

  async cancelReservation(id: number): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to cancel reservation');
    }

    return res.json();
  },
};
