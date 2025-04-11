
import React from "react";
import { Link } from "react-router-dom";
import { NavItem } from "../types/navTypes";
import { 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel,
  SidebarMenu, 
  SidebarMenuItem,
  SidebarMenuButton
} from "@/components/ui/sidebar";

type LocationsSectionProps = {
  items: NavItem[];
  isActive: (path: string) => boolean;
  isCollapsed: boolean;
};

const LocationsSection = ({ items, isActive, isCollapsed }: LocationsSectionProps) => {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Locations</SidebarGroupLabel>
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
                  <item.icon size={16} />
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

export default LocationsSection;
