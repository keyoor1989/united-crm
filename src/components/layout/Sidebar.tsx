
import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import SidebarItem from "./sidebar/SidebarItem";
import SidebarSection from "./sidebar/SidebarSection";
import SidebarLogo from "./sidebar/SidebarLogo";
import { 
  mainNavItems, 
  serviceSection, 
  inventorySection, 
  locationNavItems 
} from "./sidebar/sidebarNavConfig";

const Sidebar = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  const isSectionActive = (paths: string[]) => paths.some(path => 
    location.pathname === path || location.pathname.startsWith(path + "/")
  );
  
  const [openSections, setOpenSections] = useState<string[]>(
    [
      // Open the service section by default if we're on a service-related page
      (location.pathname === "/service" || location.pathname === "/engineer-performance") ? "service" : "",
      // Open the inventory section by default if we're on an inventory-related page
      (location.pathname.startsWith("/inventory")) ? "inventory" : ""
    ].filter(Boolean)
  );

  const toggleSection = (section: string) => {
    setOpenSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section) 
        : [...prev, section]
    );
  };

  const isServiceSectionOpen = openSections.includes("service");
  const isInventorySectionOpen = openSections.includes("inventory");

  return (
    <div className="h-screen w-64 bg-sidebar fixed left-0 top-0 border-r border-sidebar-border flex flex-col">
      <SidebarLogo />

      <div className="flex-1 py-4 px-3 flex flex-col gap-1 overflow-y-auto">
        {/* Main Navigation Items */}
        {mainNavItems.slice(0, 2).map((item) => (
          <SidebarItem
            key={item.to}
            to={item.to}
            icon={<item.icon size={20} />}
            label={item.label}
            isActive={isActive(item.to)}
          />
        ))}
        
        {/* Service Section */}
        <SidebarSection
          icon={<serviceSection.icon size={20} />}
          label={serviceSection.label}
          isActive={isSectionActive(serviceSection.items.map(item => item.to))}
          isOpen={isServiceSectionOpen}
          onToggle={() => toggleSection("service")}
        >
          {serviceSection.items.map((item) => (
            <SidebarItem
              key={item.to}
              to={item.to}
              icon={<item.icon size={16} />}
              label={item.label}
              isActive={isActive(item.to)}
            />
          ))}
        </SidebarSection>
        
        {/* Inventory Section */}
        <SidebarSection
          icon={<inventorySection.icon size={20} />}
          label={inventorySection.label}
          isActive={isSectionActive(inventorySection.items.map(item => item.to))}
          isOpen={isInventorySectionOpen}
          onToggle={() => toggleSection("inventory")}
        >
          {inventorySection.items.map((item) => (
            <SidebarItem
              key={item.to}
              to={item.to}
              icon={<item.icon size={16} />}
              label={item.label}
              isActive={isActive(item.to)}
            />
          ))}
        </SidebarSection>
        
        {/* Remaining Main Navigation Items */}
        {mainNavItems.slice(2, -1).map((item) => (
          <SidebarItem
            key={item.to}
            to={item.to}
            icon={<item.icon size={20} />}
            label={item.label}
            isActive={isActive(item.to)}
          />
        ))}

        <div className="mt-4 mb-2 px-3">
          <p className="text-xs font-semibold uppercase text-sidebar-foreground/50">
            Locations
          </p>
        </div>
        
        {/* Location Navigation Items */}
        {locationNavItems.map((item) => (
          <SidebarItem
            key={item.to}
            to={item.to}
            icon={<item.icon size={20} />}
            label={item.label}
            isActive={isActive(item.to)}
          />
        ))}
      </div>

      <div className="mt-auto p-4 border-t border-sidebar-border">
        {/* Settings Item (Last item from mainNavItems) */}
        <SidebarItem
          to={mainNavItems[mainNavItems.length - 1].to}
          icon={<mainNavItems[mainNavItems.length - 1].icon size={20} />}
          label={mainNavItems[mainNavItems.length - 1].label}
          isActive={isActive(mainNavItems[mainNavItems.length - 1].to)}
        />
      </div>
    </div>
  );
};

export default Sidebar;
