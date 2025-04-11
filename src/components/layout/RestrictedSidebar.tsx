
import React from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { isRouteAccessible } from "@/utils/rbac/rolePermissions";
import { 
  mainNavItems, 
  serviceSection, 
  inventorySection,
  quotationsSection,
  reportsSection,
  locationNavItems,
  taskSection
} from "./sidebar/config";
import { 
  Sidebar as SidebarComp, 
  SidebarContent, 
  SidebarFooter, 
  SidebarHeader,
  useSidebar
} from "@/components/ui/sidebar";
import SidebarLogo from "./sidebar/SidebarLogo";
import "./sidebar/sidebar.css";
import MainNavItems from "./sidebar/sections/MainNavItems";
import FinanceNavItem from "./sidebar/sections/FinanceNavItem";
import SectionGroup from "./sidebar/sections/SectionGroup";
import LocationsSection from "./sidebar/sections/LocationsSection";
import FooterNavItem from "./sidebar/sections/FooterNavItem";

const RestrictedSidebar = () => {
  const location = useLocation();
  const { state } = useSidebar();
  const { user, hasPermission } = useAuth();
  
  // Filter main nav items based on user permissions
  const filteredMainNavItems = mainNavItems.filter(item => {
    // Always show Dashboard
    if (item.to === "/") return true;
    
    // Check permissions for specific routes
    if (item.to === "/customers" && !hasPermission("crm")) return false;
    if (item.to === "/finance" && !hasPermission("cash_register") && !hasPermission("revenue_expense")) return false;
    if (item.to === "/reports" && !hasPermission("reports")) return false;
    if (item.to === "/tasks" && !hasPermission("task_system") && !hasPermission("assigned_tasks")) return false;
    
    // Settings and chat are accessible to all
    return true;
  });
  
  const isActive = (path: string) => location.pathname === path;
  
  const isSectionActive = (paths: string[]) => paths.some(path => 
    location.pathname === path || location.pathname.startsWith(path + "/")
  );
  
  const initialSections = [
    (location.pathname === "/service" || location.pathname === "/engineer-performance") && hasPermission("service_calls") ? "service" : "",
    (location.pathname.startsWith("/inventory")) && hasPermission("inventory") ? "inventory" : "",
    (location.pathname.startsWith("/quotation") || location.pathname.startsWith("/purchase-order") || 
    location.pathname === "/quotations" || location.pathname === "/purchase-orders" || 
    location.pathname === "/sent-quotations" || location.pathname === "/sent-orders" || 
    location.pathname === "/order-history" || location.pathname === "/quotation-products" ||
    location.pathname === "/contract-upload") && hasPermission("quotations") ? "quotations" : "",
    (location.pathname.startsWith("/tasks")) && (hasPermission("task_system") || hasPermission("assigned_tasks")) ? "tasks" : "",
    (location.pathname.startsWith("/reports")) && hasPermission("reports") ? "reports" : ""
  ].filter(Boolean);

  const [openSections, setOpenSections] = React.useState<string[]>(initialSections);

  const toggleSection = (section: string) => {
    setOpenSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section) 
        : [...prev, section]
    );
  };

  // Get the last nav item for the footer
  const lastNavItem = mainNavItems[mainNavItems.length - 1];
  const isCollapsed = state === "collapsed";

  // Show User Management in Sidebar for Super Admin
  const userManagementItem = {
    to: "/user-management",
    icon: mainNavItems[1].icon, // Reuse Users icon
    label: "User Management"
  };

  return (
    <SidebarComp>
      <SidebarHeader className="border-b border-sidebar-border">
        <SidebarLogo />
      </SidebarHeader>

      <SidebarContent className="py-4 px-3">
        {/* First two main navigation items */}
        <MainNavItems 
          items={filteredMainNavItems.slice(0, 2)} 
          isActive={isActive} 
          isCollapsed={isCollapsed} 
        />
        
        {/* User Management (for Super Admin only) */}
        {user?.role === "super_admin" && (
          <MainNavItems 
            items={[userManagementItem]} 
            isActive={isActive} 
            isCollapsed={isCollapsed} 
          />
        )}
        
        {/* Finance navigation item (if user has finance permissions) */}
        {(hasPermission("cash_register") || hasPermission("revenue_expense") || hasPermission("reports")) && (
          <FinanceNavItem 
            item={filteredMainNavItems[2]} 
            isActive={isActive} 
            isPathActive={(path) => location.pathname.startsWith(path)}
            isCollapsed={isCollapsed} 
          />
        )}
        
        {/* Task Section (if user has task permissions) */}
        {(hasPermission("task_system") || hasPermission("assigned_tasks")) && (
          <SectionGroup 
            section={taskSection}
            isOpen={openSections.includes("tasks")}
            toggleSection={() => toggleSection("tasks")}
            isSectionActive={isSectionActive}
            isActive={isActive}
            isCollapsed={isCollapsed}
          />
        )}
        
        {/* Quotations Section (if user has quotation permissions) */}
        {hasPermission("quotations") && (
          <SectionGroup 
            section={quotationsSection}
            isOpen={openSections.includes("quotations")}
            toggleSection={() => toggleSection("quotations")}
            isSectionActive={isSectionActive}
            isActive={isActive}
            isCollapsed={isCollapsed}
          />
        )}
        
        {/* Service Section (if user has service permissions) */}
        {hasPermission("service_calls") && (
          <SectionGroup 
            section={serviceSection}
            isOpen={openSections.includes("service")}
            toggleSection={() => toggleSection("service")}
            isSectionActive={isSectionActive}
            isActive={isActive}
            isCollapsed={isCollapsed}
          />
        )}
        
        {/* Inventory Section (if user has inventory permissions) */}
        {hasPermission("inventory") && (
          <SectionGroup 
            section={inventorySection}
            isOpen={openSections.includes("inventory")}
            toggleSection={() => toggleSection("inventory")}
            isSectionActive={isSectionActive}
            isActive={isActive}
            isCollapsed={isCollapsed}
          />
        )}
        
        {/* Reports Section (if user has reports permission) */}
        {hasPermission("reports") && (
          <SectionGroup 
            section={reportsSection}
            isOpen={openSections.includes("reports")}
            toggleSection={() => toggleSection("reports")}
            isSectionActive={isSectionActive}
            isActive={isActive}
            isCollapsed={isCollapsed}
          />
        )}
        
        {/* Locations section (only show if user has CRM or service permissions) */}
        {(hasPermission("crm") || hasPermission("service_calls")) && (
          <LocationsSection 
            items={locationNavItems} 
            isActive={isActive} 
            isCollapsed={isCollapsed} 
          />
        )}
      </SidebarContent>

      {/* Footer Item */}
      <SidebarFooter className="border-t border-sidebar-border p-4">
        <FooterNavItem 
          item={lastNavItem} 
          isActive={isActive} 
          isCollapsed={isCollapsed} 
        />
      </SidebarFooter>
    </SidebarComp>
  );
};

export default RestrictedSidebar;
