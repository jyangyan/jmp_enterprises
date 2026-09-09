export interface Property {
  propertyId: number;
  propertyName: string;
  propertyCode: string;
  location?: string | null;
  description?: string | null;
  defaultMonthlyRate: number;
  defaultDailyRate: number;
  status: string; // 'Available' | 'Occupied' | 'Maintenance' | 'Inactive'
  isActive: boolean;
  createdDate: string;
  updatedDate?: string | null;
}

export interface CreatePropertyDto {
  propertyName: string;
  propertyCode: string;
  location?: string;
  description?: string;
  defaultMonthlyRate: number;
  defaultDailyRate: number;
  status: string;
}

export interface UpdatePropertyDto {
  propertyName: string;
  propertyCode: string;
  location?: string;
  description?: string;
  defaultMonthlyRate: number;
  defaultDailyRate: number;
  status: string;
}
