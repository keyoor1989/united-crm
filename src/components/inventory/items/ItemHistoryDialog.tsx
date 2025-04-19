
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePurchaseHistory } from '@/hooks/inventory/usePurchaseHistory';
import { useEngineerAssignmentHistory } from '@/hooks/inventory/useEngineerAssignmentHistory';
import { useSalesHistory } from '@/hooks/inventory/useSalesHistory';
import { useReturnsHistory } from '@/hooks/inventory/useReturnsHistory';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';

interface ItemHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemName: string | null;
}

export const ItemHistoryDialog = ({ open, onOpenChange, itemName }: ItemHistoryDialogProps) => {
  if (!itemName) return null;
  
  // Fetch all history data at once
  const { data: purchaseHistory, isLoading: purchaseLoading } = usePurchaseHistory(itemName);
  const { data: engineerHistory, isLoading: engineerLoading } = useEngineerAssignmentHistory(itemName);
  const { data: salesHistory, isLoading: salesLoading } = useSalesHistory(itemName);
  const { data: returnsHistory, isLoading: returnsLoading } = useReturnsHistory(itemName);
  
  const isLoading = purchaseLoading || engineerLoading || salesLoading || returnsLoading;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), "dd MMM yyyy");
    } catch (e) {
      return dateString;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Complete Item History: {itemName}</DialogTitle>
          <DialogDescription>
            All transaction history for this item showing purchases, engineer assignments, sales, and returns
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center items-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading item history...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Purchase History Section */}
            <div>
              <h3 className="text-lg font-medium mb-2">Purchase History</h3>
              {purchaseHistory && purchaseHistory.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Rate (₹)</TableHead>
                      <TableHead>Invoice No.</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {purchaseHistory.map((record, index) => (
                      <TableRow key={`purchase-${record.id || index}`}>
                        <TableCell>{formatDate(record.date)}</TableCell>
                        <TableCell>{record.vendor}</TableCell>
                        <TableCell className="text-right">{record.quantity}</TableCell>
                        <TableCell className="text-right">₹{record.rate?.toLocaleString()}</TableCell>
                        <TableCell>{record.invoiceNo}</TableCell>
                        <TableCell>
                          {record.status && (
                            <Badge variant={record.status === 'Completed' ? 'success' : 'secondary'}>
                              {record.status || 'Pending'}
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground text-sm italic">No purchase history found</p>
              )}
            </div>

            {/* Engineer Assignments Section */}
            <div>
              <h3 className="text-lg font-medium mb-2">Engineer Assignments</h3>
              {engineerHistory && engineerHistory.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Engineer</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead>Warehouse</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {engineerHistory.map((record, index) => (
                      <TableRow key={`engineer-${record.id || index}`}>
                        <TableCell>{formatDate(record.assigned_date)}</TableCell>
                        <TableCell>{record.engineer_name}</TableCell>
                        <TableCell className="text-right">{record.quantity}</TableCell>
                        <TableCell>{record.warehouse_source || 'Main'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground text-sm italic">No engineer assignment history found</p>
              )}
            </div>

            {/* Sales History Section */}
            <div>
              <h3 className="text-lg font-medium mb-2">Sales History</h3>
              {salesHistory && salesHistory.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Unit Price</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {salesHistory.map((record, index) => (
                      <TableRow key={`sale-${record.id || index}`}>
                        <TableCell>{formatDate(record.sales?.date)}</TableCell>
                        <TableCell>{record.sales?.customer_name}</TableCell>
                        <TableCell className="text-right">{record.quantity}</TableCell>
                        <TableCell className="text-right">₹{record.unit_price?.toLocaleString()}</TableCell>
                        <TableCell className="text-right">₹{record.total?.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant={record.sales?.status === 'Completed' ? 'success' : 'secondary'}>
                            {record.sales?.status || 'Unknown'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground text-sm italic">No sales history found</p>
              )}
            </div>

            {/* Returns History Section */}
            <div>
              <h3 className="text-lg font-medium mb-2">Returns History</h3>
              {returnsHistory && returnsHistory.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Returned By</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead>Condition</TableHead>
                      <TableHead>Reason</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {returnsHistory.map((record, index) => (
                      <TableRow key={`return-${record.id || index}`}>
                        <TableCell>{formatDate(record.return_date)}</TableCell>
                        <TableCell>{record.engineer_name}</TableCell>
                        <TableCell className="text-right">{record.quantity}</TableCell>
                        <TableCell>
                          <Badge variant={record.condition === "Good" ? "success" : "destructive"}>
                            {record.condition}
                          </Badge>
                        </TableCell>
                        <TableCell>{record.reason}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground text-sm italic">No returns history found</p>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
