import React from "react";
import { Link } from "react-router-dom";
import { NavItem } from "../types/navTypes";
import { 
  SidebarMenu, 
  SidebarMenuItem,
  SidebarMenuButton
} from "@/components/ui/sidebar";

type FooterNavItemProps = {
  item: NavItem;
  isActive: (path: string) => boolean;
  isCollapsed: boolean;
};

const FooterNavItem = ({ item, isActive, isCollapsed }: FooterNavItemProps) => {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
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
    </SidebarMenu>
  );
};

export default FooterNavItem;
