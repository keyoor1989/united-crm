
import React, { ReactNode } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import { 
  SidebarProvider, 
  SidebarInset,
} from "@/components/ui/sidebar";
import AppSidebar from "./Sidebar";

interface LayoutProps {
  children?: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <SidebarProvider defaultOpen={window.innerWidth >= 1024}>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <SidebarInset className="flex flex-col">
          <Header />
          <main className="flex-1 p-6 overflow-auto">
            {children || <Outlet />}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
