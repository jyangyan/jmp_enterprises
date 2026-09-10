export interface Receipt {
  receiptId: number;
  receiptNumber: string;
  receiptType: 'Reservation' | 'Payment' | 'SecurityDeposit' | 'Checkout' | 'FinalSettlement' | 'Other' | string;

  reservationId?: number;
  paymentId?: number;

  receiptDate: string;
  paymentDate: string;
  amount: number;
  amountInWords?: string;

  guestName: string;
  guestCompanyName?: string;
  propertyName: string;
  propertyCode: string;

  paymentType: string;
  paymentMethod: string;
  referenceNumber?: string;
  purpose: string;

  rentalType?: 'ShortStay' | 'LongStay' | string;
  checkInDate?: string;
  checkOutDate?: string;
  reservationStatus?: string;
  reservationFee?: number;

  // Rental Balance Tracking
  agreedRentalAmount?: number;
  previouslyPaid?: number;
  remainingBalance?: number;

  // Checkout / Final Settlement Fields
  totalRentalAmount?: number;
  totalRentalPaymentsReceived?: number;
  securityDepositReceived?: number;
  additionalCharges?: number;
  securityDepositReturned?: number;
  outstandingBalance?: number;
  settlementStatus?: 'PAID IN FULL' | 'BALANCE REMAINING' | 'SECURITY DEPOSIT RETURNED' | 'SECURITY DEPOSIT PARTIALLY APPLIED' | string;

  notes?: string;
  issuedBy: string;
  isVoided: boolean;

  createdDate: string;
}

export interface CreateReceiptInput {
  receiptType?: string;
  reservationId?: number;
  paymentId?: number;
  receiptDate?: string;
  amount?: number;
  paymentType?: string;
  paymentMethod?: string;
  referenceNumber?: string;
  purpose?: string;
  notes?: string;
  additionalCharges?: number;
  securityDepositReturned?: number;
  settlementStatus?: string;
}

export interface CheckoutSettlementInput {
  reservationId: number;
  additionalCharges: number;
  securityDepositReturned: number;
  settlementStatus: string;
  notes?: string;

  // Direct Payment Collection at Checkout
  paymentAmount?: number;
  paymentMethod?: string;
  paymentType?: string;
  referenceNumber?: string;
}
