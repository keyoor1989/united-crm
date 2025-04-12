
import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { Send, ArrowLeft, CircleCheck } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import IssueForm from "@/components/inventory/issue/IssueForm";
import ReturnForm from "@/components/inventory/issue/ReturnForm";
import ActivityLog from "@/components/inventory/issue/ActivityLog";

const InventoryIssue = () => {
  const [activeTab, setActiveTab] = useState("issue");

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Helmet>
        <title>Inventory Management | Issue & Return</title>
      </Helmet>

      <div>
        <h1 className="text-2xl font-medium">Issue inventory to engineers or receive returns</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
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
            <CardContent className="p-6">
              <IssueForm />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="return">
          <Card>
            <CardContent className="p-6">
              <ReturnForm />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="activities">
          <Card>
            <CardContent className="p-6">
              <ActivityLog />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InventoryIssue;
