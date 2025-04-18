
import { useAuth } from "@/contexts/AuthContext";

/**
 * Filters main navigation items based on user permissions
 */
export const useFilteredMainNavItems = (mainNavItems: any[]) => {
  const { hasPermission } = useAuth();
  
  return mainNavItems.filter(item => {
    // Always show Dashboard
    if (item.to === "/") return true;
    
    // Check permissions for specific routes
    if (item.to === "/customers" && !hasPermission("crm")) return false;
    if (item.to === "/finance" && !hasPermission("cash_register") && !hasPermission("revenue_expense")) return false;
    if (item.to === "/reports" && !hasPermission("reports")) return false;
    if (item.to === "/tasks" && !hasPermission("task_system") && !hasPermission("assigned_tasks")) return false;
    
    // Make sure Command Copilot and Smart Assistant are accessible to all
    if (item.to === "/command-copilot" || item.to === "/smart-assistant") return true;
    
    // Settings and other items are accessible to all
    return true;
  });
};

/**
 * Determines initial open sections based on current location
 */
export const getInitialOpenSections = (
  pathname: string, 
  hasPermission: (permission: string) => boolean
) => {
  return [
    (pathname === "/service" || pathname === "/engineer-performance") && hasPermission("service_calls") ? "service" : "",
    (pathname.startsWith("/inventory") || pathname === "/inventory/branch-transfer" || pathname === "/inventory/purchase-entry") && hasPermission("inventory") ? "inventory" : "",
    (pathname.startsWith("/quotation") || pathname.startsWith("/purchase-order") || 
    pathname === "/quotations" || pathname === "/purchase-orders" || 
    pathname === "/sent-quotations" || pathname === "/sent-orders" || 
    pathname === "/order-history" || pathname === "/quotation-products" ||
    pathname === "/contract-upload") && hasPermission("quotations") ? "quotations" : "",
    (pathname.startsWith("/tasks")) && (hasPermission("task_system") || hasPermission("assigned_tasks")) ? "tasks" : "",
    (pathname.startsWith("/reports")) && hasPermission("reports") ? "reports" : "",
    (pathname.startsWith("/finance")) && (hasPermission("cash_register") || hasPermission("revenue_expense")) ? "finance" : ""
  ].filter(Boolean);
};

/**
 * Check if a path is currently active
 */
export const isPathActive = (currentPath: string, path: string) => currentPath === path;

/**
 * Check if any path in a section is active
 */
export const isSectionActive = (currentPath: string, paths: string[]) => paths.some(path => 
  currentPath === path || currentPath.startsWith(path + "/")
);
