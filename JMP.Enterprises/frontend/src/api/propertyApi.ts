import { Property, CreatePropertyDto, UpdatePropertyDto } from '../types/property';

const API_BASE_URL = 'http://localhost:5184/api/properties';

export const propertyApi = {
  async getProperties(includeInactive: boolean = false): Promise<Property[]> {
    const res = await fetch(`${API_BASE_URL}?includeInactive=${includeInactive}`);
    if (!res.ok) throw new Error('Failed to fetch properties');
    return res.json();
  },

  async getPropertyById(id: number): Promise<Property> {
    const res = await fetch(`${API_BASE_URL}/${id}`);
    if (!res.ok) throw new Error(`Failed to fetch property #${id}`);
    return res.json();
  },

  async createProperty(dto: CreatePropertyDto): Promise<Property> {
    const res = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || 'Failed to create property');
    }

    return res.json();
  },

  async updateProperty(id: number, dto: UpdatePropertyDto): Promise<Property> {
    const res = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || 'Failed to update property');
    }

    return res.json();
  },

  async deactivateProperty(id: number): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || 'Failed to deactivate property');
    }

    return res.json();
  },

  async reactivateProperty(id: number): Promise<Property> {
    const res = await fetch(`${API_BASE_URL}/${id}/reactivate`, {
      method: 'PATCH',
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || 'Failed to reactivate property');
    }

    return res.json();
  },
};
