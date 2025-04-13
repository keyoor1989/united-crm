
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

// Mock data for demonstration - in a real implementation, this would come from the API
const mockPurchaseHistory = [
  { id: 1, date: "2023-11-10", quantity: 10, vendor: "Kyocera Official", rate: 2800, invoiceNo: "INV-2023-110" },
  { id: 2, date: "2023-07-22", quantity: 5, vendor: "Tech Supplies Ltd", rate: 2750, invoiceNo: "INV-2023-085" },
  { id: 3, date: "2023-03-15", quantity: 15, vendor: "Office Solutions", rate: 2900, invoiceNo: "INV-2023-042" },
];

const mockIssueHistory = [
  { id: 1, date: "2023-12-18", quantity: 2, issuedTo: "John Smith (Engineer)", serviceCaseId: "SVC-2023-042" },
  { id: 2, date: "2023-11-05", quantity: 1, issuedTo: "Metro Office (Customer)", serviceCaseId: "SVC-2023-039" },
  { id: 3, date: "2023-09-28", quantity: 3, issuedTo: "Jane Cooper (Engineer)", serviceCaseId: "SVC-2023-031" },
];

const mockReturnHistory = [
  { id: 1, date: "2023-12-20", quantity: 1, returnedBy: "John Smith", condition: "Good", reason: "Unused" },
  { id: 2, date: "2023-10-15", quantity: 2, returnedBy: "Sarah Johnson", condition: "Damaged", reason: "Defective" },
];

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
            Item History: {item.name}
          </DialogTitle>
          <DialogDescription>
            Complete transaction history for {item.part_number || "N/A"} - Current Stock: {item.currentStock}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="purchase" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="purchase">Purchase History</TabsTrigger>
            <TabsTrigger value="issue">Issue History</TabsTrigger>
            <TabsTrigger value="return">Return History</TabsTrigger>
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
                    {mockPurchaseHistory.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>{formatDate(record.date)}</TableCell>
                        <TableCell>{record.vendor}</TableCell>
                        <TableCell className="text-right">{record.quantity}</TableCell>
                        <TableCell className="text-right">₹{record.rate.toLocaleString()}</TableCell>
                        <TableCell>{record.invoiceNo}</TableCell>
                      </TableRow>
                    ))}
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
                    {mockIssueHistory.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>{formatDate(record.date)}</TableCell>
                        <TableCell>{record.issuedTo}</TableCell>
                        <TableCell className="text-right">{record.quantity}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono">
                            {record.serviceCaseId}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
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
                    {mockReturnHistory.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>{formatDate(record.date)}</TableCell>
                        <TableCell>{record.returnedBy}</TableCell>
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
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ItemHistoryDialog;
