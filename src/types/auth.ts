
export type UserRole = 
  | "super_admin" 
  | "sales" 
  | "service" 
  | "finance" 
  | "inventory" 
  | "engineer" 
  | "read_only";

export type Permission = 
  | "crm" 
  | "leads" 
  | "quotations" 
  | "follow_up_report" 
  | "customer_ledger"
  | "service_calls" 
  | "amc_tracker" 
  | "task_system"
  | "cash_register" 
  | "revenue_expense" 
  | "reports"
  | "inventory" 
  | "stock_entries" 
  | "purchase"
  | "assigned_tasks";

export interface User {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: UserRole;
  branch?: string;
  isActive: boolean;
  hasSetPassword?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RoleDefinition {
  name: string;
  description: string;
  permissions: Permission[];
}

export interface Branch {
  id: string;
  name: string;
  location: string;
}
