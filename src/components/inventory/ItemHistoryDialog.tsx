
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
import { Clock, Package, ArrowDownToLine, ArrowUpRightFromCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { usePurchaseHistory } from "@/hooks/inventory/usePurchaseHistory";
import { useEngineerAssignmentHistory } from "@/hooks/inventory/useEngineerAssignmentHistory";
import { useSalesHistory } from "@/hooks/inventory/useSalesHistory";
import { useReturnsHistory } from "@/hooks/inventory/useReturnsHistory";
import { Loader2 } from "lucide-react";

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
  
  // Fetch all history data
  const { data: purchaseHistory, isLoading: purchaseLoading } = usePurchaseHistory(item.part_name || item.name);
  const { data: engineerHistory, isLoading: engineerLoading } = useEngineerAssignmentHistory(item.part_name || item.name);
  const { data: salesHistory, isLoading: salesLoading } = useSalesHistory(item.part_name || item.name);
  const { data: returnsHistory, isLoading: returnsLoading } = useReturnsHistory(item.part_name || item.name);
  
  const isLoading = purchaseLoading || engineerLoading || salesLoading || returnsLoading;

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMM yyyy");
    } catch (e) {
      return dateString;
    }
  };

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
          <div className="flex justify-center items-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading item history...</span>
          </div>
        ) : (
          <Tabs defaultValue="purchase" className="mt-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="purchase">Purchase</TabsTrigger>
              <TabsTrigger value="issue">Engineer Issues</TabsTrigger>
              <TabsTrigger value="sales">Sales</TabsTrigger>
              <TabsTrigger value="return">Returns</TabsTrigger>
            </TabsList>

            <TabsContent value="purchase" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Vendor</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                        <TableHead className="text-right">Rate (₹)</TableHead>
                        <TableHead>Invoice No.</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {purchaseHistory && purchaseHistory.length > 0 ? (
                        purchaseHistory.map((record) => (
                          <TableRow key={record.id}>
                            <TableCell>{formatDate(record.date)}</TableCell>
                            <TableCell>{record.vendor}</TableCell>
                            <TableCell className="text-right">{record.quantity}</TableCell>
                            <TableCell className="text-right">₹{record.rate?.toLocaleString()}</TableCell>
                            <TableCell>{record.invoiceNo}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center">No purchase history found</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="issue" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Issued To</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                        <TableHead>Service Case</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {engineerHistory && engineerHistory.length > 0 ? (
                        engineerHistory.map((record) => (
                          <TableRow key={record.id}>
                            <TableCell>{formatDate(record.assigned_date)}</TableCell>
                            <TableCell>{record.engineer_name}</TableCell>
                            <TableCell className="text-right">{record.quantity}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="font-mono">
                                {record.service_case_id || 'N/A'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center">No engineer assignments found</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sales" className="mt-4">
              <Card>
                <CardContent className="pt-6">
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
                      {salesHistory && salesHistory.length > 0 ? (
                        salesHistory.map((record) => (
                          <TableRow key={record.id}>
                            <TableCell>{formatDate(record.sales?.date)}</TableCell>
                            <TableCell>{record.sales?.customer_name || "Unknown"}</TableCell>
                            <TableCell className="text-right">{record.quantity}</TableCell>
                            <TableCell className="text-right">₹{record.unit_price?.toLocaleString()}</TableCell>
                            <TableCell className="text-right">₹{record.total?.toLocaleString()}</TableCell>
                            <TableCell>
                              <Badge variant={record.sales?.status === 'completed' ? 'success' : 'secondary'}>
                                {record.sales?.status || 'Pending'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center">No sales history found</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="return" className="mt-4">
              <Card>
                <CardContent className="pt-6">
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
                      {returnsHistory && returnsHistory.length > 0 ? (
                        returnsHistory.map((record) => (
                          <TableRow key={record.id}>
                            <TableCell>{formatDate(record.return_date)}</TableCell>
                            <TableCell>{record.engineer_name}</TableCell>
                            <TableCell className="text-right">{record.quantity}</TableCell>
                            <TableCell>
                              <Badge 
                                variant={record.condition === "Good" ? "success" : "destructive"}
                              >
                                {record.condition}
                              </Badge>
                            </TableCell>
                            <TableCell>{record.reason}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center">No returns history found</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
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
