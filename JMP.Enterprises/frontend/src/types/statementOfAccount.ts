export interface StatementOfAccount {
  statementOfAccountId: number;
  soaNumber: string;
  reservationId: number;
  rentalAgreementId: number;
  agreementNumber: string;
  tenantName: string;
  tenantCompanyName?: string;
  propertyName: string;
  propertyCode: string;
  billingPeriodStart: string;
  billingPeriodEnd: string;
  dueDate: string;
  issueDate: string;
  monthlyRentAmount: number;
  previousElectricityReading: number;
  presentElectricityReading: number;
  electricityConsumptionKwh: number;
  electricityRatePerKwh: number;
  electricityAmount: number;
  waterAmount: number;
  internetAmount: number;
  additionalCharges: number;
  additionalChargesDescription?: string;
  previousBalance: number;
  totalAmountDue: number;
  amountPaid: number;
  balanceRemaining: number;
  status: 'Pending' | 'PartiallyPaid' | 'Paid' | 'Overdue';
  notes?: string;
  createdDate: string;
  updatedDate?: string;
}

export interface CreateStatementOfAccountDto {
  reservationId: number;
  rentalAgreementId: number;
  billingPeriodStart: string;
  billingPeriodEnd: string;
  dueDate: string;
  monthlyRentAmount: number;
  previousElectricityReading: number;
  presentElectricityReading: number;
  electricityRatePerKwh: number;
  waterAmount: number;
  internetAmount: number;
  additionalCharges: number;
  additionalChargesDescription?: string;
  previousBalance: number;
  notes?: string;
}

export interface UpdateStatementOfAccountDto {
  billingPeriodStart: string;
  billingPeriodEnd: string;
  dueDate: string;
  monthlyRentAmount: number;
  previousElectricityReading: number;
  presentElectricityReading: number;
  electricityRatePerKwh: number;
  waterAmount: number;
  internetAmount: number;
  additionalCharges: number;
  additionalChargesDescription?: string;
  previousBalance: number;
  status: 'Pending' | 'PartiallyPaid' | 'Paid' | 'Overdue';
  notes?: string;
}

export interface RecordSoaPaymentDto {
  paymentAmount: number;
  paymentMethod: string;
  referenceNumber?: string;
  notes?: string;
}
