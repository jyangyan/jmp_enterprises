import { FinancialSummary } from '../types/financial';

const API_BASE_URL = 'http://localhost:5184/api/financials';

export const financialApi = {
  async getFinancialSummary(propertyId?: number, startDate?: string, endDate?: string): Promise<FinancialSummary> {
    const params = new URLSearchParams();
    if (propertyId) params.append('propertyId', propertyId.toString());
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const res = await fetch(`${API_BASE_URL}/summary?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch financial summary');
    return res.json();
  },
};
