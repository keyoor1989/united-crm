
import React, { ReactNode } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import { 
  SidebarProvider, 
  SidebarInset
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import RestrictedSidebar from "./RestrictedSidebar";
import "@/components/chat/chat.css";
import { useAuth } from "@/contexts/AuthContext";

interface LayoutProps {
  children?: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { isAuthenticated } = useAuth();
  
  return (
    <TooltipProvider>
      <SidebarProvider defaultOpen={window.innerWidth >= 1024}>
        <div className="flex min-h-screen w-full bg-background">
          <RestrictedSidebar />
          <SidebarInset className="flex flex-col">
            <Header />
            <main className="flex-1 p-6 overflow-auto">
              {children || <Outlet />}
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  );
};

export default Layout;
