
import React from 'react';
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import MainNavItems from "./MainNavItems";
import FinanceNavItem from "./FinanceNavItem";
import SectionGroup from "./SectionGroup";
import LocationsSection from "./LocationsSection";
import AIAssistantSection from "./AIAssistantSection";
import { useFilteredMainNavItems } from "@/utils/sidebar/permissionHelpers";
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
} from "../config";

interface SectionsContainerProps {
  isCollapsed: boolean;
}

const SectionsContainer = ({ isCollapsed }: SectionsContainerProps) => {
  const location = useLocation();
  const { user, hasPermission } = useAuth();
  const filteredMainNavItems = useFilteredMainNavItems(mainNavItems);
  
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
      <MainNavItems 
        items={filteredMainNavItems.slice(0, 1)} 
        isActive={isActive} 
        isCollapsed={isCollapsed} 
      />
      
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
      
      {(hasPermission("cash_register") || hasPermission("revenue_expense") || hasPermission("reports")) && (
        <FinanceNavItem 
          item={filteredMainNavItems[2]} 
          isActive={isActive} 
          isPathActive={(path) => location.pathname.startsWith(path)}
          isCollapsed={isCollapsed} 
        />
      )}
      
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
      
      {renderSettingsSection()}
      
      {(hasPermission("crm") || hasPermission("service_calls")) && (
        <LocationsSection 
          items={locationNavItems} 
          isActive={isActive} 
          isCollapsed={isCollapsed} 
        />
      )}
      
      <AIAssistantSection
        items={mainNavItems}
        isActive={isActive}
        isCollapsed={isCollapsed}
      />
    </>
  );
};

export default SectionsContainer;
