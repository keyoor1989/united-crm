
import React from "react";
import { 
  Sidebar as SidebarComp, 
  SidebarContent, 
  SidebarFooter, 
  SidebarHeader,
} from "@/components/ui/sidebar";
import SidebarLogo from "./sidebar/SidebarLogo";
import "./sidebar/sidebar.css";
import { mainNavItems } from "./sidebar/config";
import FooterNavItem from "./sidebar/sections/FooterNavItem";
import SectionsContainer from "./sidebar/sections/SectionsContainer";
import { useSidebarState } from "@/hooks/useSidebarState";

const AppSidebar = () => {
  const { isCollapsed } = useSidebarState();
  
  // Get the last nav item for the footer
  const lastNavItem = mainNavItems[mainNavItems.length - 1];
  
  return (
    <SidebarComp>
      <SidebarHeader className="border-b border-sidebar-border">
        <SidebarLogo />
      </SidebarHeader>

      <SidebarContent className="py-4 px-3">
        <SectionsContainer isCollapsed={isCollapsed} />
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <FooterNavItem 
          item={lastNavItem} 
          isActive={(path) => location.pathname === path} 
          isCollapsed={isCollapsed} 
        />
      </SidebarFooter>
    </SidebarComp>
  );
};

export default AppSidebar;
