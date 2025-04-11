
import React from "react";
import { Link } from "react-router-dom";
import { 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarMenu, 
  SidebarMenuItem,
  SidebarMenuButton
} from "@/components/ui/sidebar";

type UserManagementSectionProps = {
  userManagementItem: any;
  isActive: (path: string) => boolean;
  isCollapsed: boolean;
};

const UserManagementSection = ({ 
  userManagementItem, 
  isActive, 
  isCollapsed 
}: UserManagementSectionProps) => {
  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              asChild 
              isActive={isActive(userManagementItem.to)}
              tooltip={isCollapsed ? userManagementItem.label : undefined}
            >
              <Link to={userManagementItem.to}>
                <userManagementItem.icon size={20} />
                <span>{userManagementItem.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};

export default UserManagementSection;
