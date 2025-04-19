
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PurchaseItemRow } from './PurchaseItemRow';
import { format } from "date-fns";

interface PurchaseDetailsProps {
  purchase: any;
  open: boolean;
  onClose: () => void;
  formatDate: (date: string) => string;
  getParsedItems: (items: any) => any[];
}

export const PurchaseDetailsDialog = ({
  purchase,
  open,
  onClose,
  formatDate,
  getParsedItems
}: PurchaseDetailsProps) => {
  if (!purchase) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Purchase Order Details: {purchase.poNumber}</DialogTitle>
          <DialogDescription>
            Detailed breakdown of items in Purchase Order {purchase.poNumber}
          </DialogDescription>
        </DialogHeader>
        <div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p><strong>Vendor:</strong> {purchase.vendorName}</p>
              <p><strong>Date:</strong> {formatDate(purchase.createdAt)}</p>
              <p><strong>Status:</strong> {purchase.status}</p>
            </div>
            <div className="text-right">
              <p><strong>Subtotal:</strong> ₹{purchase.subtotal.toLocaleString()}</p>
              <p><strong>GST:</strong> ₹{purchase.totalGst.toLocaleString()}</p>
              <p><strong>Grand Total:</strong> ₹{purchase.grandTotal.toLocaleString()}</p>
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item Name</TableHead>
                <TableHead>Brand/Model</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {getParsedItems(purchase.items).map((item: any, index: number) => (
                <PurchaseItemRow key={index} item={item} />
              ))}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
};
