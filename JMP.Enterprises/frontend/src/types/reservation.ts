export interface Reservation {
  reservationId: number;
  propertyId: number;
  propertyName: string;
  propertyCode: string;
  guestId: number;
  guestName: string;
  guestCompanyName?: string | null;
  guestMobileNumber?: string | null;
  rentalType: string; // 'ShortStay' | 'LongStay'
  bookingSource: string; // 'Direct' | 'Airbnb' | 'Facebook' | 'Referral' | 'Other'
  checkInDate: string;
  checkOutDate: string;
  numberOfNights: number;
  dailyRate: number;
  monthlyRate: number;
  agreedRentalAmount: number;
  securityDeposit: number;
  reservationFee: number;
  reservationStatus: string; // 'Inquiry' | 'Reserved' | 'Confirmed' | 'CheckedIn' | 'CheckedOut' | 'Cancelled'
  notes?: string | null;
  createdDate: string;
  updatedDate?: string | null;
}

export interface CreateReservationDto {
  propertyId: number;
  guestId: number;
  rentalType: string;
  bookingSource: string;
  checkInDate: string;
  checkOutDate: string;
  dailyRate: number;
  monthlyRate: number;
  agreedRentalAmount: number;
  securityDeposit: number;
  reservationFee: number;
  reservationStatus: string;
  notes?: string;
}

export interface UpdateReservationDto {
  propertyId: number;
  guestId: number;
  rentalType: string;
  bookingSource: string;
  checkInDate: string;
  checkOutDate: string;
  dailyRate: number;
  monthlyRate: number;
  agreedRentalAmount: number;
  securityDeposit: number;
  reservationFee: number;
  reservationStatus: string;
  notes?: string;
}

export interface PropertyAvailability {
  propertyId: number;
  propertyName: string;
  propertyCode: string;
  isAvailable: boolean;
  currentReservationGuest?: string | null;
  conflictCheckIn?: string | null;
  conflictCheckOut?: string | null;
}
