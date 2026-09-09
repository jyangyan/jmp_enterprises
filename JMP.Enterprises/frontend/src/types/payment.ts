export interface Payment {
  paymentId: number;
  reservationId: number;
  propertyId: number;
  propertyName: string;
  guestId: number;
  guestName: string;
  paymentDate: string;
  amount: number;
  paymentType: 'Rent' | 'SecurityDeposit' | 'ReservationFee' | 'Utility' | 'Other' | string;
  paymentMethod: 'Cash' | 'GCash' | 'BankTransfer' | 'Check' | 'Other' | string;
  referenceNumber?: string;
  notes?: string;
  createdDate: string;
}

export interface CreatePaymentDto {
  reservationId: number;
  paymentDate: string;
  amount: number;
  paymentType: string;
  paymentMethod: string;
  referenceNumber?: string;
  notes?: string;
}

export interface UpdatePaymentDto {
  paymentDate: string;
  amount: number;
  paymentType: string;
  paymentMethod: string;
  referenceNumber?: string;
  notes?: string;
}

export interface ReservationPaymentSummary {
  reservationId: number;
  propertyName: string;
  guestName: string;
  totalCost: number;
  totalPaid: number;
  balanceDue: number;
  status: 'FullyPaid' | 'Partial' | 'Unpaid' | 'Overpaid' | string;
}
