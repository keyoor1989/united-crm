
import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { 
  mainNavItems, 
  serviceSection, 
  inventorySection, 
  locationNavItems 
} from "./sidebar/sidebarNavConfig";
import { ChevronDown, ChevronRight } from "lucide-react";
import "./sidebar/sidebar.css";

const AppSidebar = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  const isSectionActive = (paths: string[]) => paths.some(path => 
    location.pathname === path || location.pathname.startsWith(path + "/")
  );
  
  const initialSections = [
    (location.pathname === "/service" || location.pathname === "/engineer-performance") ? "service" : "",
    (location.pathname.startsWith("/inventory")) ? "inventory" : ""
  ].filter(Boolean);

  const [openSections, setOpenSections] = useState<string[]>(initialSections);

  const toggleSection = (section: string) => {
    setOpenSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section) 
        : [...prev, section]
    );
  };

  const isServiceSectionOpen = openSections.includes("service");
  const isInventorySectionOpen = openSections.includes("inventory");

  // Get the last nav item for the footer
  const lastNavItem = mainNavItems[mainNavItems.length - 1];

  return (
    <div className="h-screen w-64 bg-sidebar fixed left-0 top-0 border-r border-sidebar-border flex flex-col">
      {/* Logo Section */}
      <div className="p-4 border-b border-sidebar-border flex items-center gap-2">
        <div className="bg-brand-500 text-white p-1.5 rounded">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6"
          >
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
            <circle cx="9" cy="9" r="2" />
            <path d="M15 9h.01" />
            <path d="M15 15h.01" />
            <path d="M9 15h.01" />
          </svg>
        </div>
        <div className="flex flex-col">
          <h1 className="font-bold text-lg text-sidebar-foreground">
            Copier Command
          </h1>
          <span className="text-xs text-sidebar-foreground/70">Center</span>
        </div>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 py-4 px-3 flex flex-col gap-1 overflow-y-auto">
        {/* First two main navigation items */}
        {mainNavItems.slice(0, 2).map((item) => (
          <a
            key={item.to}
            href={item.to}
            className={`sidebar-item ${isActive(item.to) ? 'active' : ''}`}
          >
            <item.icon size={20} />
            <span className="text-sm font-medium">{item.label}</span>
          </a>
        ))}
        
        {/* Service Section */}
        <div className="flex flex-col">
          <button 
            onClick={() => toggleSection("service")} 
            className={`sidebar-item ${isSectionActive(serviceSection.items.map(item => item.to)) ? 'active' : ''} cursor-pointer`}
          >
            <serviceSection.icon size={20} />
            <span className="text-sm font-medium">{serviceSection.label}</span>
            {isServiceSectionOpen ? 
              <ChevronDown size={16} className="ml-auto" /> : 
              <ChevronRight size={16} className="ml-auto" />
            }
          </button>
          
          {isServiceSectionOpen && (
            <div className="pl-8 flex flex-col gap-1 mt-1">
              {serviceSection.items.map((item) => (
                <a
                  key={item.to}
                  href={item.to}
                  className={`sidebar-item ${isActive(item.to) ? 'active' : ''}`}
                >
                  <item.icon size={16} />
                  <span className="text-sm font-medium">{item.label}</span>
                </a>
              ))}
            </div>
          )}
        </div>
        
        {/* Inventory Section */}
        <div className="flex flex-col">
          <button 
            onClick={() => toggleSection("inventory")} 
            className={`sidebar-item ${isSectionActive(inventorySection.items.map(item => item.to)) ? 'active' : ''} cursor-pointer`}
          >
            <inventorySection.icon size={20} />
            <span className="text-sm font-medium">{inventorySection.label}</span>
            {isInventorySectionOpen ? 
              <ChevronDown size={16} className="ml-auto" /> : 
              <ChevronRight size={16} className="ml-auto" />
            }
          </button>
          
          {isInventorySectionOpen && (
            <div className="pl-8 flex flex-col gap-1 mt-1">
              {inventorySection.items.map((item) => (
                <a
                  key={item.to}
                  href={item.to}
                  className={`sidebar-item ${isActive(item.to) ? 'active' : ''}`}
                >
                  <item.icon size={16} />
                  <span className="text-sm font-medium">{item.label}</span>
                </a>
              ))}
            </div>
          )}
        </div>
        
        {/* Middle main navigation items */}
        {mainNavItems.slice(2, -1).map((item) => (
          <a
            key={item.to}
            href={item.to}
            className={`sidebar-item ${isActive(item.to) ? 'active' : ''}`}
          >
            <item.icon size={20} />
            <span className="text-sm font-medium">{item.label}</span>
          </a>
        ))}

        {/* Locations section */}
        <div className="mt-4 mb-2 px-3">
          <p className="text-xs font-semibold uppercase text-sidebar-foreground/50">
            Locations
          </p>
        </div>
        
        {locationNavItems.map((item) => (
          <a
            key={item.to}
            href={item.to}
            className={`sidebar-item ${isActive(item.to) ? 'active' : ''}`}
          >
            <item.icon size={20} />
            <span className="text-sm font-medium">{item.label}</span>
          </a>
        ))}
      </div>

      {/* Footer Item */}
      <div className="mt-auto p-4 border-t border-sidebar-border">
        <a
          href={lastNavItem.to}
          className={`sidebar-item ${isActive(lastNavItem.to) ? 'active' : ''}`}
        >
          <lastNavItem.icon size={20} />
          <span className="text-sm font-medium">{lastNavItem.label}</span>
        </a>
      </div>
    </div>
  );
};

export default AppSidebar;
