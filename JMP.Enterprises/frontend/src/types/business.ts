export type BusinessCode = 'RENTAL' | 'LAUNDRY' | 'PRINT' | 'MINIMART';

export type UserRole = 'SuperAdmin' | 'Owner' | 'Manager' | 'Staff' | 'Viewer';

export interface Business {
  businessId: number;
  businessCode: BusinessCode;
  businessName: string;
  description?: string;
  icon?: string;
  route?: string;
  isActive: boolean;
  displayOrder: number;
  isImplemented: boolean;
}

export interface UserBusinessAccess {
  userBusinessAccessId?: number;
  userId: string;
  businessId: number;
  businessCode: BusinessCode;
  businessName: string;
  role: UserRole;
  canAccess: boolean;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDeleteOrVoid: boolean;
}

export interface UpdateUserBusinessAccessDto {
  userId: string;
  role: UserRole;
  allowedBusinessIds: number[];
}
