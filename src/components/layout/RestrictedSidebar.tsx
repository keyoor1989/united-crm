
import React from "react";
import { useLocation } from "react-router-dom";
import { mainNavItems } from "./sidebar/config";
import { 
  Sidebar as SidebarComp, 
  SidebarContent as SidebarContentContainer, 
  SidebarFooter, 
  SidebarHeader,
  useSidebar
} from "@/components/ui/sidebar";
import SidebarLogo from "./sidebar/SidebarLogo";
import "./sidebar/sidebar.css";
import SidebarContent from "./sidebar/SidebarContent";
import FooterNavItem from "./sidebar/sections/FooterNavItem";

const RestrictedSidebar = () => {
  const location = useLocation();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  
  // Get the last nav item for the footer
  const lastNavItem = mainNavItems[mainNavItems.length - 1];
  
  const isActive = (path: string) => location.pathname === path;

  return (
    <SidebarComp>
      <SidebarHeader className="border-b border-sidebar-border">
        <SidebarLogo />
      </SidebarHeader>

      <SidebarContentContainer className="py-4 px-3">
        <SidebarContent />
      </SidebarContentContainer>

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
