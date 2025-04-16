
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Building2,
  ChevronDown,
  Monitor, 
  Package,
  MessageSquare,
  Users,
  FileCog,
  Send,
  MessagesSquare
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export function MainNav() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const isAdmin = user?.email === "admin@unitedcopier.com";
  
  return (
    <div className="mr-4 hidden md:flex">
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <Link to="/dashboard" className={navigationMenuTriggerStyle()}>
              <BarChart3 className="mr-2 h-4 w-4" />
              Dashboard
            </Link>
          </NavigationMenuItem>
          
          <NavigationMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-9 px-4 py-2 text-sm font-medium flex items-center">
                  <Users className="mr-2 h-4 w-4" />
                  Customers
                  <ChevronDown className="ml-1 h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => navigate("/customers")}>
                  <Users className="mr-2 h-4 w-4" />
                  All Customers
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/customers/follow-ups")}>
                  <Users className="mr-2 h-4 w-4" />
                  Leads
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/customers/follow-ups")}>
                  <MessagesSquare className="mr-2 h-4 w-4" />
                  Follow-ups
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </NavigationMenuItem>
          
          <NavigationMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-9 px-4 py-2 text-sm font-medium flex items-center">
                  <Package className="mr-2 h-4 w-4" />
                  Inventory
                  <ChevronDown className="ml-1 h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => navigate("/inventory")}>
                  <Package className="mr-2 h-4 w-4" />
                  Stock Overview
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/inventory/purchase-entry")}>
                  <FileCog className="mr-2 h-4 w-4" />
                  Purchase Orders
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </NavigationMenuItem>
          
          <NavigationMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-9 px-4 py-2 text-sm font-medium flex items-center">
                  <Building2 className="mr-2 h-4 w-4" />
                  Business
                  <ChevronDown className="ml-1 h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => navigate("/quotations")}>
                  <FileCog className="mr-2 h-4 w-4" />
                  Quotations
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/finance")}>
                  <FileCog className="mr-2 h-4 w-4" />
                  Sales & Billing
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/service")}>
                  <Monitor className="mr-2 h-4 w-4" />
                  Service Calls
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </NavigationMenuItem>
          
          <NavigationMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-9 px-4 py-2 text-sm font-medium flex items-center">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Communication
                  <ChevronDown className="ml-1 h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => navigate("/smart-assistant")}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Assistant
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem onClick={() => navigate("/telegram-admin")}>
                    <Send className="mr-2 h-4 w-4" />
                    Telegram Bot
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";
