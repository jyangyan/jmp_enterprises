export interface RentalAgreement {
  rentalAgreementId: number;
  agreementNumber: string;
  reservationId: number;
  agreementDate: string;
  rentalStartDate: string;
  rentalEndDate: string;
  numberOfMonths: number;
  monthlyRent: number;
  reservationFee: number;
  isReservationFeeDeductible: boolean;
  securityDeposit: number;
  advancePayment: number;
  hasPet: boolean;
  petDescription?: string;
  maximumOccupants: number;
  electricityResponsibility: string;
  waterResponsibility: string;
  internetResponsibility: string;
  agreementStatus: 'Draft' | 'Finalized' | 'Cancelled';
  additionalTerms?: string;
  earlyTerminationTerms?: string;

  tenantName: string;
  tenantCompanyName?: string;
  tenantMobile?: string;
  propertyName: string;
  propertyCode: string;

  finalizedDate?: string;
  createdDate: string;
  updatedDate?: string;
}

export interface CreateRentalAgreementDto {
  reservationId: number;
  agreementDate?: string;
  advancePayment?: number;
  hasPet?: boolean;
  petDescription?: string;
  maximumOccupants?: number;
  electricityResponsibility?: string;
  waterResponsibility?: string;
  internetResponsibility?: string;
  additionalTerms?: string;
  earlyTerminationTerms?: string;
}

export interface UpdateRentalAgreementDto {
  agreementDate: string;
  rentalStartDate: string;
  rentalEndDate: string;
  numberOfMonths: number;
  monthlyRent: number;
  reservationFee: number;
  isReservationFeeDeductible: boolean;
  securityDeposit: number;
  advancePayment: number;
  hasPet: boolean;
  petDescription?: string;
  maximumOccupants: number;
  electricityResponsibility: string;
  waterResponsibility: string;
  internetResponsibility: string;
  additionalTerms?: string;
  earlyTerminationTerms?: string;
}
