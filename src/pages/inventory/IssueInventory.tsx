
import React from "react";
import { Helmet } from "react-helmet";
import { ArrowDown, Box } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import InventoryIssueForm from "@/components/inventory/issue/InventoryIssueForm";

const IssueInventory = () => {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <Helmet>
        <title>Issue Inventory | Inventory Management</title>
      </Helmet>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Issue Inventory</h1>
          <p className="text-muted-foreground">
            Assign inventory items to engineers, customers, or branches
          </p>
        </div>
      </div>

      <Tabs defaultValue="issue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="issue">Issue Items</TabsTrigger>
          <TabsTrigger value="history">Issue History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="issue" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <Card className="mb-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl flex items-center">
                  <Box className="h-5 w-5 mr-2" />
                  Issue Inventory Item
                </CardTitle>
                <CardDescription>
                  Issue items to engineers, customers, or branches
                </CardDescription>
              </CardHeader>
              <CardContent>
                <InventoryIssueForm />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Issue History</CardTitle>
              <CardDescription>
                Recent inventory issues and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>History will be displayed here (to be implemented)</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IssueInventory;
