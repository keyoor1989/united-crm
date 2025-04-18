
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { PurchaseHistoryTab } from './tabs/PurchaseHistoryTab';
import { EngineerAssignmentsTab } from './tabs/EngineerAssignmentsTab';
import { SalesHistoryTab } from './tabs/SalesHistoryTab';
import { ReturnsHistoryTab } from './tabs/ReturnsHistoryTab';

interface ItemHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemName: string | null;
}

export const ItemHistoryDialog = ({ open, onOpenChange, itemName }: ItemHistoryDialogProps) => {
  if (!itemName) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Item History: {itemName}</DialogTitle>
          <DialogDescription>
            Complete transaction history showing purchases, engineer assignments, sales, and returns
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="purchase_history" className="mt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="purchase_history">Purchase History</TabsTrigger>
            <TabsTrigger value="engineer_assignments">Engineer Assignments</TabsTrigger>
            <TabsTrigger value="sales">Sales History</TabsTrigger>
            <TabsTrigger value="returns">Returns History</TabsTrigger>
          </TabsList>

          <TabsContent value="purchase_history">
            <PurchaseHistoryTab itemName={itemName} />
          </TabsContent>

          <TabsContent value="engineer_assignments">
            <EngineerAssignmentsTab itemName={itemName} />
          </TabsContent>

          <TabsContent value="sales">
            <SalesHistoryTab itemName={itemName} />
          </TabsContent>

          <TabsContent value="returns">
            <ReturnsHistoryTab itemName={itemName} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
