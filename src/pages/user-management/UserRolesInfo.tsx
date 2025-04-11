
import React from "react";
import { roleNames, roleDescriptions, rolePermissions } from "@/utils/rbac/rolePermissions";
import { UserRole, Permission } from "@/types/auth";
import { 
  Shield, 
  CheckCircle, 
  XCircle,
  ChevronDown, 
  ChevronUp
} from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Helper function to get human-readable permission name
const getPermissionName = (permission: Permission): string => {
  const map: Record<Permission, string> = {
    crm: "CRM & Customers",
    leads: "Leads Management",
    quotations: "Quotations",
    follow_up_report: "Follow-up Reports",
    customer_ledger: "Customer Ledger",
    service_calls: "Service Calls",
    amc_tracker: "AMC Tracker",
    task_system: "Task System",
    cash_register: "Cash Register",
    revenue_expense: "Revenue & Expenses",
    reports: "Reports Access",
    inventory: "Inventory Management",
    stock_entries: "Stock Entries",
    purchase: "Purchase Management",
    assigned_tasks: "Assigned Tasks Only"
  };
  
  return map[permission] || permission;
};

const UserRolesInfo: React.FC = () => {
  // Get all unique permissions across all roles
  const allPermissions = Array.from(
    new Set(
      Object.values(rolePermissions).flat()
    )
  );
  
  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Role Permissions Overview
        </h2>
        
        <Accordion type="single" collapsible className="w-full">
          {(Object.entries(roleNames) as [UserRole, string][]).map(([role, name]) => (
            <AccordionItem key={role} value={role}>
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-semibold">
                    {name}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {roleDescriptions[role as UserRole]}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mt-2">
                  {allPermissions.map(permission => {
                    const hasPermission = rolePermissions[role as UserRole].includes(permission);
                    
                    return (
                      <div 
                        key={`${role}-${permission}`} 
                        className={`flex items-center gap-2 p-2 rounded-md ${
                          hasPermission 
                            ? "text-green-600 dark:text-green-400" 
                            : "text-red-600 dark:text-red-400 opacity-50"
                        }`}
                      >
                        {hasPermission ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                        <span className="text-sm">
                          {getPermissionName(permission)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default UserRolesInfo;
