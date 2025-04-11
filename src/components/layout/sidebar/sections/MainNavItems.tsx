
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

type MainNavItemsProps = {
  items: NavItem[];
  isActive: (path: string) => boolean;
  isCollapsed: boolean;
};

const MainNavItems = ({ items, isActive, isCollapsed }: MainNavItemsProps) => {
  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
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
  );
};

export default MainNavItems;
