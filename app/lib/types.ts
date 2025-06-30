
import { UserRole, CustomerStatus, ContactType, LeadStatus } from '@prisma/client';

export interface User {
  id: string;
  name?: string | null;
  email: string;
  role: UserRole;
  tenantId?: string | null;
  tenantName?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Customer {
  id: string;
  companyName: string;
  contactPerson?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  postalCode?: string | null;
  country?: string | null;
  status: CustomerStatus;
  notes?: string | null;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
  contactHistories?: ContactHistory[];
}

export interface ContactHistory {
  id: string;
  customerId: string;
  userId: string;
  type: ContactType;
  description: string;
  createdAt: Date;
  user?: {
    name?: string | null;
    email: string;
  };
}

export interface Lead {
  id: string;
  companyName: string;
  contactPerson?: string | null;
  email?: string | null;
  phone?: string | null;
  status: LeadStatus;
  source?: string | null;
  notes?: string | null;
  estimatedValue?: number | null;
  tenantId: string;
  assignedUserId?: string | null;
  createdAt: Date;
  updatedAt: Date;
  assignedUser?: {
    name?: string | null;
    email: string;
  };
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardStats {
  totalCustomers: number;
  totalLeads: number;
  totalUsers: number;
  activeCustomers: number;
  newLeadsThisMonth: number;
}

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      role: UserRole;
      tenantId?: string | null;
      tenantName?: string | null;
    };
  }

  interface User {
    role: UserRole;
    tenantId?: string | null;
    tenantName?: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: UserRole;
    tenantId?: string | null;
    tenantName?: string | null;
  }
}
