
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface PurchaseTabsProps {
  children: React.ReactNode;
}

export function PurchaseTabs({ children }: PurchaseTabsProps) {
  return (
    <Tabs defaultValue="purchase-entry" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="purchase-entry">Purchase Entry</TabsTrigger>
        <TabsTrigger value="purchase-history">Purchase History</TabsTrigger>
      </TabsList>
      
      <TabsContent value="purchase-entry">
        <Card>
          <CardContent className="p-6">
            {children}
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="purchase-history">
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <h3 className="text-lg font-medium">Purchase History</h3>
              <p className="text-muted-foreground">View and manage your purchase history here</p>
              <Button className="mt-4" variant="outline" onClick={() => toast.info("Purchase history feature will be implemented soon")}>
                View All Purchases
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
