import React from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSidebar } from "@/components/ui/sidebar";
import { 
  mainNavItems, 
  serviceSection, 
  inventorySection,
  quotationsSection,
  reportsSection,
  locationNavItems,
  taskSection,
  customersSection,
  sidebarSections
} from "./config";
import { useFilteredMainNavItems } from "@/utils/sidebar/permissionHelpers";
import MainNavItems from "./sections/MainNavItems";
import FinanceNavItem from "./sections/FinanceNavItem";
import SectionGroup from "./sections/SectionGroup";
import LocationsSection from "./sections/LocationsSection";
import AIAssistantSection from "./sections/AIAssistantSection";
import UserManagementSection from "./sections/UserManagementSection";

const SidebarContent = () => {
  const location = useLocation();
  const { state } = useSidebar();
  const { user, hasPermission } = useAuth();
  const filteredMainNavItems = useFilteredMainNavItems(mainNavItems);
  const isCollapsed = state === "collapsed";
  
  // User Management for Super Admin
  const userManagementItem = {
    to: "/user-management",
    icon: mainNavItems[1].icon, // Reuse Users icon
    label: "User Management"
  };
  
  const isActive = (path: string) => location.pathname === path;
  
  const isSectionActive = (paths: string[]) => paths.some(path => 
    location.pathname === path || location.pathname.startsWith(path + "/")
  );
  
  // Initialize open sections based on current path
  const initialSections = [
    (location.pathname === "/customers" || location.pathname.startsWith("/customer")) && hasPermission("crm") ? "customers" : "",
    (location.pathname === "/service" || location.pathname === "/engineer-performance") && hasPermission("service_calls") ? "service" : "",
    (location.pathname.startsWith("/inventory")) && hasPermission("inventory") ? "inventory" : "",
    (location.pathname.startsWith("/quotation") || location.pathname.startsWith("/purchase-order") || 
    location.pathname === "/quotations" || location.pathname === "/purchase-orders" || 
    location.pathname === "/sent-quotations" || location.pathname === "/sent-orders" || 
    location.pathname === "/order-history" || location.pathname === "/quotation-products" ||
    location.pathname === "/contract-upload") && hasPermission("quotations") ? "quotations" : "",
    (location.pathname.startsWith("/tasks")) && (hasPermission("task_system") || hasPermission("assigned_tasks")) ? "tasks" : "",
    (location.pathname.startsWith("/reports")) && hasPermission("reports") ? "reports" : "",
    (location.pathname === "/telegram-admin") ? "settings" : ""
  ].filter(Boolean);

  const [openSections, setOpenSections] = React.useState<string[]>(initialSections);

  const toggleSection = (section: string) => {
    setOpenSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section) 
        : [...prev, section]
    );
  };

  // Handle rendering settings section
  const renderSettingsSection = () => {
    const settingsSection = sidebarSections[sidebarSections.length - 1];
    return (
      <SectionGroup 
        section={{
          key: "settings",
          label: settingsSection.title,
          icon: settingsSection.items[0].icon,
          items: settingsSection.items.map(item => ({
            to: item.href,
            label: item.title,
            icon: item.icon
          }))
        }}
        isOpen={openSections.includes("settings")}
        toggleSection={() => toggleSection("settings")}
        isSectionActive={isSectionActive}
        isActive={isActive}
        isCollapsed={isCollapsed}
      />
    );
  };

  return (
    <>
      {/* First main navigation item (Dashboard) */}
      <MainNavItems 
        items={filteredMainNavItems.slice(0, 1)} 
        isActive={isActive} 
        isCollapsed={isCollapsed} 
      />
      
      {/* Customers Section (if user has CRM permissions) */}
      {hasPermission("crm") && (
        <SectionGroup 
          section={customersSection}
          isOpen={openSections.includes("customers")}
          toggleSection={() => toggleSection("customers")}
          isSectionActive={isSectionActive}
          isActive={isActive}
          isCollapsed={isCollapsed}
        />
      )}
      
      {/* User Management (for Super Admin only) */}
      {user?.role === "super_admin" && (
        <UserManagementSection
          userManagementItem={userManagementItem}
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
      
      {/* Settings Section (always visible) */}
      {renderSettingsSection()}
      
      {/* Locations section (only show if user has CRM or service permissions) */}
      {(hasPermission("crm") || hasPermission("service_calls")) && (
        <LocationsSection 
          items={locationNavItems} 
          isActive={isActive} 
          isCollapsed={isCollapsed} 
        />
      )}
      
      {/* Command Copilot and Smart Assistant (available to all users) */}
      <AIAssistantSection
        items={mainNavItems}
        isActive={isActive}
        isCollapsed={isCollapsed}
      />
    </>
  );
};

export default SidebarContent;
