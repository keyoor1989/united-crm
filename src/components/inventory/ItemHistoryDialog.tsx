
import React from "react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { InventoryItem } from "@/types/inventory";
import { 
  Clock, 
  Package, 
  ArrowDownToLine, 
  ArrowUpRightFromCircle, 
  Undo2, 
  ShoppingCart 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { usePurchaseHistory } from "@/hooks/inventory/usePurchaseHistory";
import { useEngineerAssignmentHistory } from "@/hooks/inventory/useEngineerAssignmentHistory";
import { useSalesHistory } from "@/hooks/inventory/useSalesHistory";
import { useReturnsHistory } from "@/hooks/inventory/useReturnsHistory";
import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface ItemHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: InventoryItem | null;
}

const ItemHistoryDialog: React.FC<ItemHistoryDialogProps> = ({
  open,
  onOpenChange,
  item,
}) => {
  if (!item) return null;
  
  // The item name to use for fetching history - use the most specific name available
  const itemNameForQuery = item.part_name || item.name;
  
  // Fetch all history data
  const { data: purchaseHistory, isLoading: purchaseLoading } = usePurchaseHistory(itemNameForQuery);
  const { data: engineerHistory, isLoading: engineerLoading } = useEngineerAssignmentHistory(itemNameForQuery);
  const { data: salesHistory, isLoading: salesLoading } = useSalesHistory(itemNameForQuery);
  const { data: returnsHistory, isLoading: returnsLoading } = useReturnsHistory(itemNameForQuery);
  
  const isLoading = purchaseLoading || engineerLoading || salesLoading || returnsLoading;

  // Helper to format dates consistently
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "dd MMM yyyy");
    } catch (e) {
      return dateString || "N/A";
    }
  };

  // Skeleton loader component for tables
  const TableSkeleton = () => (
    <div className="space-y-3">
      <div className="flex space-x-4">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
      </div>
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex space-x-4">
          <Skeleton className="h-12 w-full" />
        </div>
      ))}
    </div>
  );

  // Empty state component
  const EmptyState = ({ message }: { message: string }) => (
    <div className="text-center py-8 text-muted-foreground">
      <Package className="mx-auto h-12 w-12 opacity-20 mb-3" />
      <p>{message}</p>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Item History: {item.name || item.part_name}
          </DialogTitle>
          <DialogDescription>
            Complete transaction history for {item.part_number || "N/A"} - Current Stock: {item.currentStock || item.quantity}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-8 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span>Loading item history...</span>
          </div>
        ) : (
          <Tabs defaultValue="purchase" className="mt-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="purchase" className="flex items-center gap-1">
                <ArrowDownToLine className="h-4 w-4" />
                <span className="hidden sm:inline">Purchase</span>
              </TabsTrigger>
              <TabsTrigger value="issue" className="flex items-center gap-1">
                <ArrowUpRightFromCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Engineers</span>
              </TabsTrigger>
              <TabsTrigger value="sales" className="flex items-center gap-1">
                <ShoppingCart className="h-4 w-4" />
                <span className="hidden sm:inline">Sales</span>
              </TabsTrigger>
              <TabsTrigger value="return" className="flex items-center gap-1">
                <Undo2 className="h-4 w-4" />
                <span className="hidden sm:inline">Returns</span>
              </TabsTrigger>
            </TabsList>

            {/* Purchase History Tab */}
            <TabsContent value="purchase" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  {purchaseLoading ? (
                    <TableSkeleton />
                  ) : purchaseHistory && purchaseHistory.length > 0 ? (
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
                            <TableCell>{record.vendor || "N/A"}</TableCell>
                            <TableCell className="text-right">{record.quantity}</TableCell>
                            <TableCell className="text-right">
                              {typeof record.rate === 'number' 
                                ? `₹${record.rate.toLocaleString()}`
                                : "N/A"}
                            </TableCell>
                            <TableCell>{record.invoiceNo || "N/A"}</TableCell>
                            <TableCell>
                              {record.status && (
                                <Badge variant={record.status.toLowerCase() === "completed" ? "success" : "secondary"}>
                                  {record.status}
                                </Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <EmptyState message="No purchase history found for this item" />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Engineer Assignments Tab */}
            <TabsContent value="issue" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  {engineerLoading ? (
                    <TableSkeleton />
                  ) : engineerHistory && engineerHistory.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Issued To</TableHead>
                          <TableHead className="text-right">Quantity</TableHead>
                          <TableHead>Warehouse</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {engineerHistory.map((record, index) => (
                          <TableRow key={`engineer-${record.id || index}`}>
                            <TableCell>{formatDate(record.assigned_date)}</TableCell>
                            <TableCell>{record.engineer_name || "Unknown"}</TableCell>
                            <TableCell className="text-right">{record.quantity}</TableCell>
                            <TableCell>{record.warehouse_source || "Main"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <EmptyState message="No engineer assignments found for this item" />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Sales History Tab */}
            <TabsContent value="sales" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  {salesLoading ? (
                    <TableSkeleton />
                  ) : salesHistory && salesHistory.length > 0 ? (
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
                            <TableCell>{record.sales?.customer_name || "Unknown"}</TableCell>
                            <TableCell className="text-right">{record.quantity}</TableCell>
                            <TableCell className="text-right">
                              {typeof record.unit_price === 'number'
                                ? `₹${record.unit_price.toLocaleString()}`
                                : "N/A"}
                            </TableCell>
                            <TableCell className="text-right">
                              {typeof record.total === 'number'
                                ? `₹${record.total.toLocaleString()}`
                                : "N/A"}
                            </TableCell>
                            <TableCell>
                              {record.sales?.status && (
                                <Badge variant={
                                  record.sales.status.toLowerCase() === "completed" ? "success" : 
                                  record.sales.status.toLowerCase() === "pending" ? "warning" : "secondary"
                                }>
                                  {record.sales.status}
                                </Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <EmptyState message="No sales history found for this item" />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Returns History Tab */}
            <TabsContent value="return" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  {returnsLoading ? (
                    <TableSkeleton />
                  ) : returnsHistory && returnsHistory.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Returned By</TableHead>
                          <TableHead className="text-right">Quantity</TableHead>
                          <TableHead>Condition</TableHead>
                          <TableHead>Reason</TableHead>
                          <TableHead>Notes</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {returnsHistory.map((record, index) => (
                          <TableRow key={`return-${record.id || index}`}>
                            <TableCell>{formatDate(record.return_date)}</TableCell>
                            <TableCell>{record.engineer_name || "Unknown"}</TableCell>
                            <TableCell className="text-right">{record.quantity}</TableCell>
                            <TableCell>
                              <Badge variant={
                                record.condition === "Good" ? "success" : 
                                record.condition === "Damaged" ? "destructive" : "warning"
                              }>
                                {record.condition}
                              </Badge>
                            </TableCell>
                            <TableCell>{record.reason || "N/A"}</TableCell>
                            <TableCell className="max-w-[150px] truncate" title={record.notes || ""}>
                              {record.notes || "N/A"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <EmptyState message="No returns history found for this item" />
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ItemHistoryDialog;
