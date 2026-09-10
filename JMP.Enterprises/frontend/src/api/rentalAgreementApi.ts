import { RentalAgreement, CreateRentalAgreementDto, UpdateRentalAgreementDto } from '../types/rentalAgreement';

const API_BASE_URL = 'http://localhost:5184/api/RentalAgreements';

export const rentalAgreementApi = {
  getById: async (id: number): Promise<RentalAgreement> => {
    const res = await fetch(`${API_BASE_URL}/${id}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch rental agreement #${id}`);
    }
    return res.json();
  },

  getByReservationId: async (reservationId: number): Promise<RentalAgreement | null> => {
    const res = await fetch(`${API_BASE_URL}/reservation/${reservationId}`);
    if (res.status === 404) {
      return null;
    }
    if (!res.ok) {
      throw new Error(`Failed to fetch agreement for reservation #${reservationId}`);
    }
    return res.json();
  },

  generateDraft: async (reservationId: number, customDto?: CreateRentalAgreementDto): Promise<RentalAgreement> => {
    const res = await fetch(`${API_BASE_URL}/generate-draft/${reservationId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(customDto || {})
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to generate draft rental agreement');
    }
    return res.json();
  },

  updateDraft: async (id: number, dto: UpdateRentalAgreementDto): Promise<RentalAgreement> => {
    const res = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to update rental agreement draft');
    }
    return res.json();
  },

  finalize: async (id: number): Promise<RentalAgreement> => {
    const res = await fetch(`${API_BASE_URL}/${id}/finalize`, {
      method: 'POST'
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to finalize rental agreement');
    }
    return res.json();
  },

  cancel: async (id: number): Promise<RentalAgreement> => {
    const res = await fetch(`${API_BASE_URL}/${id}/cancel`, {
      method: 'POST'
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to cancel rental agreement');
    }
    return res.json();
  }
};
