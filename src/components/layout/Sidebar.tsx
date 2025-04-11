
import React from "react";
import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import { 
  mainNavItems, 
  serviceSection, 
  inventorySection,
  quotationsSection,
  reportsSection,
  locationNavItems 
} from "./sidebar/sidebarNavConfig";
import { ChevronDown, ChevronRight } from "lucide-react";
import { 
  Sidebar as SidebarComponent, 
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
import SidebarLogo from "./sidebar/SidebarLogo";
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
  const isReportsSectionOpen = openSections.includes("reports");

  // Get the last nav item for the footer
  const lastNavItem = mainNavItems[mainNavItems.length - 1];
  const isCollapsed = state === "collapsed";

  return (
    <SidebarComponent>
      <SidebarHeader className="border-b border-sidebar-border">
        <SidebarLogo />
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
        
        {/* Finance navigation item */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild 
                  isActive={isActive(mainNavItems[2].to) || location.pathname.startsWith("/finance/")}
                  tooltip={isCollapsed ? mainNavItems[2].label : undefined}
                >
                  <Link to={mainNavItems[2].to}>
                    <mainNavItems[2].icon size={20} />
                    <span>{mainNavItems[2].label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
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
        
        {/* Reports Section */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => toggleSection("reports")} 
                  isActive={isSectionActive(reportsSection.items.map(item => item.to))}
                  tooltip={isCollapsed ? reportsSection.label : undefined}
                >
                  <reportsSection.icon size={20} />
                  <span>{reportsSection.label}</span>
                  {isReportsSectionOpen ? 
                    <ChevronDown size={16} className="ml-auto" /> : 
                    <ChevronRight size={16} className="ml-auto" />
                  }
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              {isReportsSectionOpen && (
                <SidebarMenu>
                  {reportsSection.items.map((item) => (
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
                      <item.icon size={16} />
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
    </SidebarComponent>
  );
};

export default AppSidebar;
