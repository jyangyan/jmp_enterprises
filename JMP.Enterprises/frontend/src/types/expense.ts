export interface Expense {
  expenseId: number;
  propertyId?: number;
  propertyName?: string;
  expenseDate: string;
  category: 'Maintenance' | 'Utilities' | 'Cleaning' | 'HOA Fees' | 'Taxes' | 'Supplies' | 'Other' | string;
  amount: number;
  vendorPayee?: string;
  description: string;
  receiptReference?: string;
  createdDate: string;
}

export interface CreateExpenseDto {
  propertyId?: number;
  expenseDate: string;
  category: string;
  amount: number;
  vendorPayee?: string;
  description: string;
  receiptReference?: string;
}

export interface UpdateExpenseDto {
  propertyId?: number;
  expenseDate: string;
  category: string;
  amount: number;
  vendorPayee?: string;
  description: string;
  receiptReference?: string;
}

export interface ExpenseCategorySummary {
  category: string;
  totalAmount: number;
  expenseCount: number;
  percentage: number;
}
