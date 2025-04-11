
import { UserRole, Permission } from "@/types/auth";

// Define which permissions each role has
export const rolePermissions: Record<UserRole, Permission[]> = {
  super_admin: [
    "crm", "leads", "quotations", "follow_up_report", "customer_ledger",
    "service_calls", "amc_tracker", "task_system",
    "cash_register", "revenue_expense", "reports",
    "inventory", "stock_entries", "purchase",
    "assigned_tasks"
  ],
  sales: [
    "crm", "leads", "quotations", "follow_up_report", "customer_ledger"
  ],
  service: [
    "service_calls", "amc_tracker", "task_system", "assigned_tasks"
  ],
  finance: [
    "cash_register", "revenue_expense", "reports", "customer_ledger"
  ],
  inventory: [
    "inventory", "stock_entries", "purchase"
  ],
  engineer: [
    "assigned_tasks", "service_calls"
  ],
  read_only: [
    "reports"
  ]
};

// Define human-readable names for roles
export const roleNames: Record<UserRole, string> = {
  super_admin: "Super Admin",
  sales: "Sales",
  service: "Service",
  finance: "Finance",
  inventory: "Inventory",
  engineer: "Engineer",
  read_only: "Read-only"
};

// Define descriptions for roles
export const roleDescriptions: Record<UserRole, string> = {
  super_admin: "Full access to all system features",
  sales: "Access to CRM, leads, quotations and related reports",
  service: "Access to service calls, AMC tracker and task system",
  finance: "Access to financial modules and reports",
  inventory: "Access to inventory and stock management",
  engineer: "Limited access to assigned tasks and service calls",
  read_only: "View-only access to reports"
};

// Map permissions to routes that require them
export const permissionToRoutes: Record<Permission, string[]> = {
  crm: ["/customers", "/customer-form"],
  leads: ["/customers"],
  quotations: ["/quotations", "/quotation-form", "/sent-quotations", "/quotation-products"],
  follow_up_report: ["/reports/customer-followup"],
  customer_ledger: ["/finance/payments", "/finance/receivables"],
  service_calls: ["/service", "/service-call-form", "/engineer-performance"],
  amc_tracker: ["/inventory/amc-tracker"],
  task_system: ["/tasks"],
  cash_register: ["/finance/cash-register"],
  revenue_expense: ["/finance/revenue", "/finance/expenses"],
  reports: ["/reports", "/reports/machine-rental", "/reports/engineer-service", "/reports/branch-profit"],
  inventory: ["/inventory", "/inventory/items", "/inventory/warehouses"],
  stock_entries: ["/inventory/history", "/inventory/transfer", "/inventory/branch-transfer"],
  purchase: ["/inventory/purchase", "/inventory/vendors", "/purchase-orders", "/sent-orders"],
  assigned_tasks: ["/tasks"]
};

// Check if a route is accessible for a specific role
export const isRouteAccessible = (route: string, role: UserRole): boolean => {
  if (role === "super_admin") return true;
  
  const rolePerms = rolePermissions[role] || [];
  
  // Check if any permission the role has grants access to this route
  return rolePerms.some(permission => {
    const routes = permissionToRoutes[permission] || [];
    return routes.some(permRoute => 
      route === permRoute || route.startsWith(permRoute + "/")
    );
  });
};
