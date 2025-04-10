
import React from "react";
import { Bell, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Header = () => {
  return (
    <header className="h-16 border-b px-6 flex items-center justify-end bg-background">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          className="hidden md:flex gap-1 text-darkblue-500 border-darkblue-500"
        >
          <span className="hidden lg:inline-block">Create Quotation</span>
          <span className="lg:hidden">+ Quote</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="hidden md:flex gap-1 text-brand-500 border-brand-500"
        >
          <span className="hidden lg:inline-block">New Service Call</span>
          <span className="lg:hidden">+ Service</span>
        </Button>

        <div className="relative">
          <Bell className="h-5 w-5 text-muted-foreground cursor-pointer hover:text-brand-500 transition-colors" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full">
            3
          </span>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-2 cursor-pointer">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder.svg" alt="User" />
                <AvatarFallback className="bg-brand-500 text-white">AD</AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-sm font-medium">Admin</div>
              <ChevronDown className="h-4 w-4" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Company Settings</DropdownMenuItem>
            <DropdownMenuItem>Preferences</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
