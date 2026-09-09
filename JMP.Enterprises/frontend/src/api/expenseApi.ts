import { Expense, CreateExpenseDto, UpdateExpenseDto, ExpenseCategorySummary } from '../types/expense';

const API_BASE_URL = 'http://localhost:5184/api/expenses';

export const expenseApi = {
  async getExpenses(
    propertyId?: number,
    category?: string,
    startDate?: string,
    endDate?: string
  ): Promise<Expense[]> {
    const params = new URLSearchParams();
    if (propertyId) params.append('propertyId', propertyId.toString());
    if (category && category !== 'All') params.append('category', category);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const res = await fetch(`${API_BASE_URL}?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch expenses');
    return res.json();
  },

  async getExpenseById(id: number): Promise<Expense> {
    const res = await fetch(`${API_BASE_URL}/${id}`);
    if (!res.ok) throw new Error(`Failed to fetch expense #${id}`);
    return res.json();
  },

  async getCategorySummaries(propertyId?: number, startDate?: string, endDate?: string): Promise<ExpenseCategorySummary[]> {
    const params = new URLSearchParams();
    if (propertyId) params.append('propertyId', propertyId.toString());
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const res = await fetch(`${API_BASE_URL}/categories/summary?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch expense category summaries');
    return res.json();
  },

  async createExpense(dto: CreateExpenseDto): Promise<Expense> {
    const res = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to record expense');
    }

    return res.json();
  },

  async updateExpense(id: number, dto: UpdateExpenseDto): Promise<Expense> {
    const res = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to update expense');
    }

    return res.json();
  },

  async deleteExpense(id: number): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to delete expense');
    }
  },
};
