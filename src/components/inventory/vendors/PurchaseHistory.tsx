
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Vendor } from '@/types/inventory';
import { ScrollArea } from '@/components/ui/scroll-area';

interface PurchaseHistoryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendor: Vendor | null;
}

export const PurchaseHistory: React.FC<PurchaseHistoryProps> = ({
  open,
  onOpenChange,
  vendor,
}) => {
  // This component would fetch and display the purchase history for the selected vendor
  // For now, we'll display a placeholder
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>
            Purchase History: {vendor?.name || 'Unknown Vendor'}
          </DialogTitle>
          <DialogDescription>
            Complete purchase history for this vendor
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[400px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Invoice</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No purchase history found for this vendor.
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </ScrollArea>
        
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
