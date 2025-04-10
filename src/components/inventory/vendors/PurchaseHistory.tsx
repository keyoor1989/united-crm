
import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Store,
  ShoppingCart,
  Phone,
  Mail,
  MapPin,
  AlertTriangle,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { Vendor } from "@/types/inventory";

interface PurchaseHistoryProps {
  selectedVendor: Vendor | null;
  setActiveTab: (tab: string) => void;
  formatDate: (dateString: string) => string;
  purchaseHistory: {
    id: string;
    vendorId: string;
    vendorName: string;
    itemName: string;
    quantity: number;
    purchaseRate: number;
    purchaseDate: string;
    invoiceNo: string;
  }[];
  searchQuery: string;
}

const PurchaseHistory: React.FC<PurchaseHistoryProps> = ({
  selectedVendor,
  setActiveTab,
  formatDate,
  purchaseHistory,
  searchQuery,
}) => {
  // Filter purchase history for the selected vendor
  const getVendorPurchaseHistory = (vendorId: string) => {
    return purchaseHistory.filter(purchase => 
      purchase.vendorId === vendorId &&
      (searchQuery ? 
        purchase.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        purchase.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase())
      : true)
    );
  };

  if (!selectedVendor) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Vendor Purchase History</CardTitle>
          <CardDescription>
            Select a vendor to view their purchase history
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8">
            <Store className="h-12 w-12 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">
              Please select a vendor from the Vendors tab to view their purchase history
            </p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => setActiveTab("vendors")}
            >
              Go to Vendors
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Purchase History: {selectedVendor.name}</CardTitle>
          <CardDescription>
            Items purchased from {selectedVendor.name}
          </CardDescription>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => setActiveTab("vendors")}
          >
            Back to Vendors
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-md bg-muted/50">
          <div>
            <h3 className="text-sm font-semibold mb-2">Vendor Details</h3>
            <div className="space-y-1">
              <p className="text-sm flex items-center gap-2">
                <Store className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{selectedVendor.name}</span>
              </p>
              <p className="text-sm flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span>{selectedVendor.gstNo || "GST not available"}</span>
              </p>
              <p className="text-sm flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{selectedVendor.address}</span>
              </p>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-2">Contact Information</h3>
            <div className="space-y-1">
              <p className="text-sm flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{selectedVendor.phone}</span>
              </p>
              <p className="text-sm flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{selectedVendor.email}</span>
              </p>
              <p className="text-sm flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                <span>Vendor since {formatDate(selectedVendor.createdAt)}</span>
              </p>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Purchase Transactions</h3>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => toast.success("Feature coming soon!")}
              className="gap-1"
            >
              <ShoppingCart className="h-4 w-4" />
              New Purchase
            </Button>
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Invoice No.</TableHead>
                <TableHead>Purchase Date</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead className="text-right">Rate (₹)</TableHead>
                <TableHead className="text-right">Total (₹)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {getVendorPurchaseHistory(selectedVendor.id).map((purchase) => (
                <TableRow key={purchase.id}>
                  <TableCell className="font-medium">{purchase.itemName}</TableCell>
                  <TableCell>{purchase.invoiceNo}</TableCell>
                  <TableCell>{formatDate(purchase.purchaseDate)}</TableCell>
                  <TableCell>{purchase.quantity}</TableCell>
                  <TableCell className="text-right">{purchase.purchaseRate.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{(purchase.purchaseRate * purchase.quantity).toLocaleString()}</TableCell>
                </TableRow>
              ))}
              
              {getVendorPurchaseHistory(selectedVendor.id).length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No purchase history found for this vendor
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default PurchaseHistory;
