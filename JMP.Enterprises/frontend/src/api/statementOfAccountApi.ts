import { 
  StatementOfAccount, 
  CreateStatementOfAccountDto, 
  UpdateStatementOfAccountDto, 
  RecordSoaPaymentDto 
} from '../types/statementOfAccount';

const API_BASE_URL = 'http://localhost:5184/api/StatementsOfAccount';

export const statementOfAccountApi = {
  getAll: async (status?: string): Promise<StatementOfAccount[]> => {
    const url = status ? `${API_BASE_URL}?status=${encodeURIComponent(status)}` : API_BASE_URL;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch Statements of Account');
    return res.json();
  },

  getById: async (id: number): Promise<StatementOfAccount> => {
    const res = await fetch(`${API_BASE_URL}/${id}`);
    if (!res.ok) throw new Error(`Failed to fetch SOA #${id}`);
    return res.json();
  },

  getByReservationId: async (reservationId: number): Promise<StatementOfAccount[]> => {
    const res = await fetch(`${API_BASE_URL}/reservation/${reservationId}`);
    if (!res.ok) throw new Error(`Failed to fetch SOAs for reservation #${reservationId}`);
    return res.json();
  },

  getByAgreementId: async (agreementId: number): Promise<StatementOfAccount[]> => {
    const res = await fetch(`${API_BASE_URL}/agreement/${agreementId}`);
    if (!res.ok) throw new Error(`Failed to fetch SOAs for agreement #${agreementId}`);
    return res.json();
  },

  getLatestReading: async (propertyId: number): Promise<number> => {
    const res = await fetch(`${API_BASE_URL}/latest-reading/${propertyId}`);
    if (!res.ok) return 0;
    return res.json();
  },

  create: async (dto: CreateStatementOfAccountDto): Promise<StatementOfAccount> => {
    const res = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to create Statement of Account');
    }
    return res.json();
  },

  update: async (id: number, dto: UpdateStatementOfAccountDto): Promise<StatementOfAccount> => {
    const res = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to update Statement of Account');
    }
    return res.json();
  },

  recordPayment: async (id: number, dto: RecordSoaPaymentDto): Promise<StatementOfAccount> => {
    const res = await fetch(`${API_BASE_URL}/${id}/record-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to record SOA payment');
    }
    return res.json();
  },

  delete: async (id: number): Promise<void> => {
    const res = await fetch(`${API_BASE_URL}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete Statement of Account');
  }
};
