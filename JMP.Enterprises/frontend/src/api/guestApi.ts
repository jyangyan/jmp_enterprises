import { Guest, CreateGuestDto, UpdateGuestDto } from '../types/guest';

const API_BASE_URL = 'http://localhost:5184/api/guests';

export const guestApi = {
  async getGuests(includeInactive: boolean = false): Promise<Guest[]> {
    const res = await fetch(`${API_BASE_URL}?includeInactive=${includeInactive}`);
    if (!res.ok) throw new Error('Failed to fetch guests');
    return res.json();
  },

  async getGuestById(id: number): Promise<Guest> {
    const res = await fetch(`${API_BASE_URL}/${id}`);
    if (!res.ok) throw new Error(`Failed to fetch guest #${id}`);
    return res.json();
  },

  async createGuest(dto: CreateGuestDto): Promise<Guest> {
    const res = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to create guest');
    }

    return res.json();
  },

  async updateGuest(id: number, dto: UpdateGuestDto): Promise<Guest> {
    const res = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to update guest');
    }

    return res.json();
  },

  async deactivateGuest(id: number): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to deactivate guest');
    }

    return res.json();
  },

  async reactivateGuest(id: number): Promise<Guest> {
    const res = await fetch(`${API_BASE_URL}/${id}/reactivate`, {
      method: 'PATCH',
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to reactivate guest');
    }

    return res.json();
  },
};
