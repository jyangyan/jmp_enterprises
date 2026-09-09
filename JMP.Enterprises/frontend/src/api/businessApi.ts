import { Business, UserBusinessAccess, UpdateUserBusinessAccessDto } from '../types/business';

const API_BASE = '/api/businesses';

export const businessApi = {
  getBusinesses: async (): Promise<Business[]> => {
    const res = await fetch(API_BASE);
    if (!res.ok) {
      throw new Error(`Failed to fetch businesses: ${res.statusText}`);
    }
    return res.json();
  },

  getUserAccess: async (userId: string): Promise<UserBusinessAccess[]> => {
    const res = await fetch(`${API_BASE}/access/${encodeURIComponent(userId)}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch user access permissions: ${res.statusText}`);
    }
    return res.json();
  },

  updateUserAccess: async (dto: UpdateUserBusinessAccessDto): Promise<void> => {
    const res = await fetch(`${API_BASE}/access`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dto),
    });
    if (!res.ok) {
      throw new Error(`Failed to update user access: ${res.statusText}`);
    }
  },
};
