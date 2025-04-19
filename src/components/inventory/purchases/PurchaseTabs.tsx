
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { fetchPurchaseOrders } from "@/services/purchaseOrderService";

export function PurchaseTabs({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState("purchase-entry");
  const [searchQuery, setSearchQuery] = useState("");
  const [purchases, setPurchases] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<any>(null);
  
  React.useEffect(() => {
    if (activeTab === "purchase-history") {
      loadPurchaseHistory();
    }
  }, [activeTab]);
  
  const loadPurchaseHistory = async () => {
    try {
      setIsLoading(true);
      const data = await fetchPurchaseOrders();
      setPurchases(data || []);
    } catch (error) {
      console.error("Error loading purchase history:", error);
      toast.error("Failed to load purchase history");
    } finally {
      setIsLoading(false);
    }
  };
  
  const filteredPurchases = purchases.filter(purchase => 
    purchase.vendorName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    purchase.poNumber?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMM yyyy");
    } catch (e) {
      return dateString || "N/A";
    }
  };

  const handleViewPurchaseDetails = (purchase: any) => {
    setSelectedPurchase(purchase);
  };

  const closePurchaseDetailsDialog = () => {
    setSelectedPurchase(null);
  };

  const getParsedItems = (itemsData: any): any[] => {
    if (!itemsData) return [];
    
    if (Array.isArray(itemsData)) {
      return itemsData;
    }
    
    try {
      if (typeof itemsData === 'string') {
        return JSON.parse(itemsData);
      }
      
      if (typeof itemsData === 'object') {
        return [itemsData];
      }
    } catch (error) {
      console.error("Error parsing items:", error);
    }
    
    return [];
  };

  return (
    <>
      <Tabs 
        defaultValue="purchase-entry" 
        className="w-full"
        value={activeTab}
        onValueChange={setActiveTab}
      >
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
              <div className="mb-4 flex justify-between items-center">
                <h3 className="text-lg font-medium">Purchase History</h3>
                <div className="relative w-[300px]">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search purchases..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              
              {isLoading ? (
                <div className="flex justify-center items-center h-40">
                  <p>Loading purchase history...</p>
                </div>
              ) : filteredPurchases.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>PO Number</TableHead>
                        <TableHead>Vendor</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPurchases.map((purchase) => (
                        <TableRow key={purchase.id}>
                          <TableCell>{formatDate(purchase.createdAt)}</TableCell>
                          <TableCell>{purchase.poNumber}</TableCell>
                          <TableCell>{purchase.vendorName}</TableCell>
                          <TableCell>
                            {Array.isArray(purchase.items) ? purchase.items.length : '—'}
                          </TableCell>
                          <TableCell className="text-right">₹{purchase.grandTotal.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge variant={purchase.status === 'Completed' ? 'success' : 'secondary'}>
                              {purchase.status || 'Pending'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleViewPurchaseDetails(purchase)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-10 border rounded-md">
                  <p className="text-muted-foreground">No purchase history found</p>
                  <Button 
                    className="mt-4" 
                    variant="outline" 
                    onClick={() => setActiveTab("purchase-entry")}
                  >
                    Create New Purchase
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={!!selectedPurchase} onOpenChange={closePurchaseDetailsDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Purchase Order Details: {selectedPurchase?.poNumber}</DialogTitle>
            <DialogDescription>
              Detailed breakdown of items in Purchase Order {selectedPurchase?.poNumber}
            </DialogDescription>
          </DialogHeader>
          {selectedPurchase && (
            <div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p><strong>Vendor:</strong> {selectedPurchase.vendorName}</p>
                  <p><strong>Date:</strong> {formatDate(selectedPurchase.createdAt)}</p>
                  <p><strong>Status:</strong> {selectedPurchase.status}</p>
                </div>
                <div className="text-right">
                  <p><strong>Subtotal:</strong> ₹{selectedPurchase.subtotal.toLocaleString()}</p>
                  <p><strong>GST:</strong> ₹{selectedPurchase.totalGst.toLocaleString()}</p>
                  <p><strong>Grand Total:</strong> ₹{selectedPurchase.grandTotal.toLocaleString()}</p>
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
                  {getParsedItems(selectedPurchase.items).map((item: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell>{item.itemName || item.name || "N/A"}</TableCell>
                      <TableCell>
                        {item.brand ? `${item.brand}${item.model ? ` / ${item.model}` : ""}` : "N/A"}
                      </TableCell>
                      <TableCell>{item.description || "N/A"}</TableCell>
                      <TableCell>{item.category || "N/A"}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell className="text-right">₹{(item.unitPrice || item.unit_price || 0).toLocaleString()}</TableCell>
                      <TableCell className="text-right">₹{(item.total || (item.quantity * (item.unitPrice || item.unit_price || 0)) || 0).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
