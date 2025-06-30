
import { 
  UserRole, 
  CustomerStatus, 
  ContactType, 
  LeadStatus,
  InvoiceStatus,
  TransactionType,
  ProjectStatus,
  TaskStatus,
  TaskPriority,
  WidgetType,
  ReportType
} from '@prisma/client';

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

// ==================== weANALYTICS Types ====================

export interface Dashboard {
  id: string;
  name: string;
  description?: string | null;
  layout?: any;
  isDefault: boolean;
  tenantId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  widgets?: Widget[];
}

export interface Widget {
  id: string;
  dashboardId: string;
  name: string;
  type: WidgetType;
  config?: any;
  position?: any;
  size?: any;
  dataSource?: string | null;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Report {
  id: string;
  name: string;
  description?: string | null;
  type: ReportType;
  config?: any;
  data?: any;
  tenantId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    name?: string | null;
    email: string;
  };
}

export interface Metric {
  id: string;
  name: string;
  description?: string | null;
  formula: string;
  target?: number | null;
  currentValue?: number | null;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

// ==================== weFINANCE Types ====================

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId?: string | null;
  customerName: string;
  customerEmail?: string | null;
  customerAddress?: string | null;
  status: InvoiceStatus;
  issueDate: Date;
  dueDate: Date;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  notes?: string | null;
  terms?: string | null;
  tenantId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  customer?: Customer;
  user?: {
    name?: string | null;
    email: string;
  };
  items?: InvoiceItem[];
}

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  totalPrice: number;
  tenantId: string;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  category?: string | null;
  date: Date;
  reference?: string | null;
  invoiceId?: string | null;
  tenantId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  invoice?: Invoice;
  user?: {
    name?: string | null;
    email: string;
  };
}

export interface Budget {
  id: string;
  name: string;
  description?: string | null;
  category: string;
  budgetAmount: number;
  spentAmount: number;
  startDate: Date;
  endDate: Date;
  tenantId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    name?: string | null;
    email: string;
  };
}

export interface TaxCategory {
  id: string;
  name: string;
  rate: number;
  tenantId: string;
}

export interface DatevExport {
  id: string;
  filename: string;
  startDate: Date;
  endDate: Date;
  data?: any;
  tenantId: string;
  userId: string;
  createdAt: Date;
  user?: {
    name?: string | null;
    email: string;
  };
}

// ==================== wePROJECT Types ====================

export interface Project {
  id: string;
  name: string;
  description?: string | null;
  status: ProjectStatus;
  startDate?: Date | null;
  endDate?: Date | null;
  budget?: number | null;
  tenantId: string;
  managerId: string;
  createdAt: Date;
  updatedAt: Date;
  manager?: {
    name?: string | null;
    email: string;
  };
  tasks?: Task[];
  members?: ProjectMember[];
  milestones?: Milestone[];
  timesheets?: Timesheet[];
}

export interface Task {
  id: string;
  projectId: string;
  name: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId?: string | null;
  startDate?: Date | null;
  dueDate?: Date | null;
  estimatedHours?: number | null;
  actualHours?: number | null;
  parentTaskId?: string | null;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
  project?: Project;
  assignee?: {
    name?: string | null;
    email: string;
  };
  parentTask?: Task;
  subtasks?: Task[];
}

export interface Milestone {
  id: string;
  projectId: string;
  name: string;
  description?: string | null;
  dueDate: Date;
  isCompleted: boolean;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
  project?: Project;
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role?: string | null;
  joinedAt: Date;
  tenantId: string;
  project?: Project;
  user?: {
    name?: string | null;
    email: string;
  };
}

export interface Timesheet {
  id: string;
  projectId?: string | null;
  taskId?: string | null;
  userId: string;
  date: Date;
  hours: number;
  description?: string | null;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
  project?: Project;
  task?: Task;
  user?: {
    name?: string | null;
    email: string;
  };
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
