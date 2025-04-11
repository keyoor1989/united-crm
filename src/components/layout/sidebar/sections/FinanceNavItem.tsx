
import React from "react";
import { Link } from "react-router-dom";
import { NavItem } from "../types/navTypes";
import { 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarMenu, 
  SidebarMenuItem,
  SidebarMenuButton
} from "@/components/ui/sidebar";

type FinanceNavItemProps = {
  item: NavItem;
  isActive: (path: string) => boolean;
  isPathActive: (path: string) => boolean;
  isCollapsed: boolean;
};

const FinanceNavItem = ({ item, isActive, isPathActive, isCollapsed }: FinanceNavItemProps) => {
  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              asChild 
              isActive={isActive(item.to) || isPathActive("/finance/")}
              tooltip={isCollapsed ? item.label : undefined}
            >
              <Link to={item.to}>
                <item.icon size={20} />
                <span>{item.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};

export default FinanceNavItem;
