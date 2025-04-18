
import React from "react";
import { useLocation } from "react-router-dom";
import { 
  mainNavItems, 
  serviceSection, 
  inventorySection,
  quotationsSection,
  reportsSection,
  locationNavItems,
  taskSection,
  customersSection
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

const AppSidebar = () => {
  const location = useLocation();
  const { state } = useSidebar();
  const isActive = (path: string) => location.pathname === path;
  const isSectionActive = (paths: string[]) => paths.some(path => 
    location.pathname === path || location.pathname.startsWith(path + "/")
  );
  
  const initialSections = [
    (location.pathname === "/customers" || location.pathname.startsWith("/customer")) ? "customers" : "",
    (location.pathname === "/service" || location.pathname === "/engineer-performance") ? "service" : "",
    (location.pathname.startsWith("/inventory")) ? "inventory" : "",
    (location.pathname.startsWith("/quotation") || location.pathname.startsWith("/purchase-order") || 
    location.pathname === "/quotations" || location.pathname === "/purchase-orders" || 
    location.pathname === "/sent-quotations" || location.pathname === "/sent-orders" || 
    location.pathname === "/order-history" || location.pathname === "/quotation-products" ||
    location.pathname === "/contract-upload") ? "quotations" : "",
    (location.pathname.startsWith("/tasks")) ? "tasks" : "",
    (location.pathname.startsWith("/reports")) ? "reports" : ""
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

  return (
    <SidebarComp>
      <SidebarHeader className="border-b border-sidebar-border">
        <SidebarLogo />
      </SidebarHeader>

      <SidebarContent className="py-4 px-3">
        {/* Dashboard navigation item */}
        <MainNavItems 
          items={mainNavItems.slice(0, 1)} 
          isActive={isActive} 
          isCollapsed={isCollapsed} 
        />
        
        {/* Customers Section */}
        <SectionGroup 
          section={customersSection}
          isOpen={openSections.includes("customers")}
          toggleSection={() => toggleSection("customers")}
          isSectionActive={isSectionActive}
          isActive={isActive}
          isCollapsed={isCollapsed}
        />
        
        {/* Finance navigation item */}
        <FinanceNavItem 
          item={mainNavItems[2]} 
          isActive={isActive} 
          isPathActive={(path) => location.pathname.startsWith(path)}
          isCollapsed={isCollapsed} 
        />
        
        {/* Task Section */}
        <SectionGroup 
          section={taskSection}
          isOpen={openSections.includes("tasks")}
          toggleSection={() => toggleSection("tasks")}
          isSectionActive={isSectionActive}
          isActive={isActive}
          isCollapsed={isCollapsed}
        />
        
        {/* Quotations Section */}
        <SectionGroup 
          section={quotationsSection}
          isOpen={openSections.includes("quotations")}
          toggleSection={() => toggleSection("quotations")}
          isSectionActive={isSectionActive}
          isActive={isActive}
          isCollapsed={isCollapsed}
        />
        
        {/* Service Section */}
        <SectionGroup 
          section={serviceSection}
          isOpen={openSections.includes("service")}
          toggleSection={() => toggleSection("service")}
          isSectionActive={isSectionActive}
          isActive={isActive}
          isCollapsed={isCollapsed}
        />
        
        {/* Inventory Section */}
        <SectionGroup 
          section={inventorySection}
          isOpen={openSections.includes("inventory")}
          toggleSection={() => toggleSection("inventory")}
          isSectionActive={isSectionActive}
          isActive={isActive}
          isCollapsed={isCollapsed}
        />
        
        {/* Reports Section */}
        <SectionGroup 
          section={reportsSection}
          isOpen={openSections.includes("reports")}
          toggleSection={() => toggleSection("reports")}
          isSectionActive={isSectionActive}
          isActive={isActive}
          isCollapsed={isCollapsed}
        />
        
        {/* Locations section */}
        <LocationsSection 
          items={locationNavItems} 
          isActive={isActive} 
          isCollapsed={isCollapsed} 
        />
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

export default AppSidebar;
