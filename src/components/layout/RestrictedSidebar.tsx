
import React from "react";
import AppSidebar from "./Sidebar";
import { useAuth } from "@/contexts/AuthContext";

// This component only renders the sidebar if the user is authenticated
const RestrictedSidebar = () => {
  const { user } = useAuth();
  
  if (!user) return null;
  
  return <AppSidebar />;
};

export default RestrictedSidebar;
