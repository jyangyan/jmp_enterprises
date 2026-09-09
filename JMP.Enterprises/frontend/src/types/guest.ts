export interface Guest {
  guestId: number;
  firstName: string;
  lastName: string;
  fullName: string;
  companyName?: string | null;
  displayName: string;
  mobileNumber?: string | null;
  emailAddress?: string | null;
  address?: string | null;
  notes?: string | null;
  isActive: boolean;
  createdDate: string;
  updatedDate?: string | null;
}

export interface CreateGuestDto {
  firstName: string;
  lastName: string;
  companyName?: string;
  mobileNumber?: string;
  emailAddress?: string;
  address?: string;
  notes?: string;
}

export interface UpdateGuestDto {
  firstName: string;
  lastName: string;
  companyName?: string;
  mobileNumber?: string;
  emailAddress?: string;
  address?: string;
  notes?: string;
}
