
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { NavItem } from "../types/navTypes";
import { ChevronDown, ChevronRight } from "lucide-react";
import { 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarMenu, 
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem
} from "@/components/ui/sidebar";

type FinanceNavItemProps = {
  item: NavItem;
  isActive: (path: string) => boolean;
  isPathActive: (path: string) => boolean;
  isCollapsed: boolean;
};

const FinanceNavItem = ({ item, isActive, isPathActive, isCollapsed }: FinanceNavItemProps) => {
  const [isOpen, setIsOpen] = useState(isPathActive("/finance/"));
  
  const financeSubItems = [
    { to: "/finance/cash-register", label: "Cash Register" },
    { to: "/finance/revenue", label: "Revenue" },
    { to: "/finance/expenses", label: "Expenses" },
    { to: "/finance/payments", label: "Customer Payments" },
    { to: "/finance/receivables", label: "Receivables" }
  ];

  const toggleSubmenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsOpen(!isOpen);
  };
  
  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              asChild 
              isActive={isActive(item.to) || isPathActive("/finance/")}
              tooltip={isCollapsed ? item.label : undefined}
              onClick={toggleSubmenu}
            >
              <div className="flex w-full cursor-pointer">
                <item.icon size={20} />
                <span>{item.label}</span>
                {isOpen ? 
                  <ChevronDown className="ml-auto h-4 w-4" /> : 
                  <ChevronRight className="ml-auto h-4 w-4" />
                }
              </div>
            </SidebarMenuButton>
            
            {isOpen && (
              <SidebarMenuSub>
                {financeSubItems.map((subItem) => (
                  <SidebarMenuSubItem key={subItem.to}>
                    <SidebarMenuSubButton
                      asChild
                      isActive={isActive(subItem.to)}
                    >
                      <Link to={subItem.to}>
                        {subItem.label}
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                ))}
              </SidebarMenuSub>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};

export default FinanceNavItem;
