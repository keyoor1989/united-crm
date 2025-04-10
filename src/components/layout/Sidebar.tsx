
import React from "react";
import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import { 
  mainNavItems, 
  serviceSection, 
  inventorySection,
  quotationsSection,
  locationNavItems 
} from "./sidebar/sidebarNavConfig";
import { ChevronDown, ChevronRight } from "lucide-react";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem,
  useSidebar
} from "@/components/ui/sidebar";
import "./sidebar/sidebar.css";

const AppSidebar = () => {
  const location = useLocation();
  const { state } = useSidebar();
  const isActive = (path: string) => location.pathname === path;
  const isSectionActive = (paths: string[]) => paths.some(path => 
    location.pathname === path || location.pathname.startsWith(path + "/")
  );
  
  const initialSections = [
    (location.pathname === "/service" || location.pathname === "/engineer-performance") ? "service" : "",
    (location.pathname.startsWith("/inventory")) ? "inventory" : "",
    (location.pathname.startsWith("/quotation") || location.pathname.startsWith("/purchase-order") || 
    location.pathname === "/quotations" || location.pathname === "/purchase-orders" || 
    location.pathname === "/sent-quotations" || location.pathname === "/sent-orders" || 
    location.pathname === "/order-history" || location.pathname === "/quotation-products" ||
    location.pathname === "/contract-upload") ? "quotations" : ""
  ].filter(Boolean);

  const [openSections, setOpenSections] = React.useState<string[]>(initialSections);

  const toggleSection = (section: string) => {
    setOpenSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section) 
        : [...prev, section]
    );
  };

  const isServiceSectionOpen = openSections.includes("service");
  const isInventorySectionOpen = openSections.includes("inventory");
  const isQuotationsSectionOpen = openSections.includes("quotations");

  // Get the last nav item for the footer
  const lastNavItem = mainNavItems[mainNavItems.length - 1];
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="p-4 flex items-center gap-2">
          <div className="bg-brand-500 text-white p-1.5 rounded flex-shrink-0">
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
      </SidebarHeader>

      <SidebarContent className="py-4 px-3">
        {/* First two main navigation items */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.slice(0, 2).map((item) => (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={isActive(item.to)}
                    tooltip={isCollapsed ? item.label : undefined}
                  >
                    <Link to={item.to}>
                      <item.icon size={20} />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        {/* Quotations Section */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => toggleSection("quotations")} 
                  isActive={isSectionActive(quotationsSection.items.map(item => item.to))}
                  tooltip={isCollapsed ? quotationsSection.label : undefined}
                >
                  <quotationsSection.icon size={20} />
                  <span>{quotationsSection.label}</span>
                  {isQuotationsSectionOpen ? 
                    <ChevronDown size={16} className="ml-auto" /> : 
                    <ChevronRight size={16} className="ml-auto" />
                  }
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              {isQuotationsSectionOpen && (
                <SidebarMenu>
                  {quotationsSection.items.map((item) => (
                    <SidebarMenuItem key={item.to}>
                      <SidebarMenuButton 
                        asChild 
                        isActive={isActive(item.to)}
                        tooltip={isCollapsed ? item.label : undefined}
                      >
                        <Link to={item.to}>
                          <item.icon size={16} />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        {/* Service Section */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => toggleSection("service")} 
                  isActive={isSectionActive(serviceSection.items.map(item => item.to))}
                  tooltip={isCollapsed ? serviceSection.label : undefined}
                >
                  <serviceSection.icon size={20} />
                  <span>{serviceSection.label}</span>
                  {isServiceSectionOpen ? 
                    <ChevronDown size={16} className="ml-auto" /> : 
                    <ChevronRight size={16} className="ml-auto" />
                  }
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              {isServiceSectionOpen && (
                <SidebarMenu>
                  {serviceSection.items.map((item) => (
                    <SidebarMenuItem key={item.to}>
                      <SidebarMenuButton 
                        asChild 
                        isActive={isActive(item.to)}
                        tooltip={isCollapsed ? item.label : undefined}
                      >
                        <Link to={item.to}>
                          <item.icon size={16} />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        {/* Inventory Section */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => toggleSection("inventory")} 
                  isActive={isSectionActive(inventorySection.items.map(item => item.to))}
                  tooltip={isCollapsed ? inventorySection.label : undefined}
                >
                  <inventorySection.icon size={20} />
                  <span>{inventorySection.label}</span>
                  {isInventorySectionOpen ? 
                    <ChevronDown size={16} className="ml-auto" /> : 
                    <ChevronRight size={16} className="ml-auto" />
                  }
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              {isInventorySectionOpen && (
                <SidebarMenu>
                  {inventorySection.items.map((item) => (
                    <SidebarMenuItem key={item.to}>
                      <SidebarMenuButton 
                        asChild 
                        isActive={isActive(item.to)}
                        tooltip={isCollapsed ? item.label : undefined}
                      >
                        <Link to={item.to}>
                          <item.icon size={16} />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        {/* Middle main navigation items */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.slice(2, -1).map((item) => (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={isActive(item.to)}
                    tooltip={isCollapsed ? item.label : undefined}
                  >
                    <Link to={item.to}>
                      <item.icon size={20} />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Locations section */}
        <SidebarGroup>
          <SidebarGroupLabel>Locations</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {locationNavItems.map((item) => (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={isActive(item.to)}
                    tooltip={isCollapsed ? item.label : undefined}
                  >
                    <Link to={item.to}>
                      <item.icon size={20} />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer Item */}
      <SidebarFooter className="border-t border-sidebar-border p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              asChild 
              isActive={isActive(lastNavItem.to)}
              tooltip={isCollapsed ? lastNavItem.label : undefined}
            >
              <Link to={lastNavItem.to}>
                <lastNavItem.icon size={20} />
                <span>{lastNavItem.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
