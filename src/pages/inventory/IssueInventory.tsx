
import React from "react";
import { Helmet } from "react-helmet";
import { Send, ArrowLeft, CircleCheck } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import InventoryIssueForm from "@/components/inventory/issue/InventoryIssueForm";
import { Card, CardContent } from "@/components/ui/card";
import ActivityLog from "@/components/inventory/issue/ActivityLog";

const IssueInventory = () => {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <Helmet>
        <title>Issue Inventory | Inventory Management</title>
      </Helmet>

      <div>
        <h1 className="text-2xl font-medium">Issue inventory to engineers or receive returns</h1>
      </div>

      <Tabs defaultValue="issue" className="space-y-4">
        <TabsList className="bg-white border rounded-md p-1 w-full max-w-xl justify-start">
          <TabsTrigger 
            value="issue" 
            className="flex items-center gap-2 data-[state=active]:bg-slate-100 data-[state=active]:shadow-none px-6"
          >
            <Send className="h-4 w-4" />
            Issue Item
          </TabsTrigger>
          <TabsTrigger 
            value="return" 
            className="flex items-center gap-2 data-[state=active]:bg-slate-100 data-[state=active]:shadow-none px-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Return Item
          </TabsTrigger>
          <TabsTrigger 
            value="activities" 
            className="flex items-center gap-2 data-[state=active]:bg-slate-100 data-[state=active]:shadow-none px-6"
          >
            <CircleCheck className="h-4 w-4" />
            Recent Activities
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="issue" className="space-y-4">
          <Card className="rounded-md">
            <CardContent className="p-0">
              <InventoryIssueForm />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="return">
          <Card>
            <CardContent>
              <p>Return functionality will be implemented here</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="activities">
          <Card>
            <CardContent>
              <ActivityLog />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IssueInventory;
