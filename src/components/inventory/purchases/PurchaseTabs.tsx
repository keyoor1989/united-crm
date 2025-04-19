
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
import { fetchPurchaseOrders } from "@/services/purchaseOrderService";
import { PurchaseDetailsDialog } from "./PurchaseDetailsDialog";

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
    
    let items = [];
    
    try {
      if (typeof itemsData === 'string') {
        items = JSON.parse(itemsData);
      } else if (Array.isArray(itemsData)) {
        items = itemsData;
      } else if (typeof itemsData === 'object') {
        items = [itemsData];
      }
      
      return items.map(item => {
        // Extract brand from different possible locations
        const brand = item.brand || 
                     (item.specs && item.specs.brand) || 
                     '';
                     
        // Extract model from different possible locations
        const model = item.model || 
                     (item.specs && item.specs.model) || 
                     '';
        
        return {
          itemName: item.itemName || item.name || '',
          brand: brand,
          model: model,
          description: item.description || '',
          category: item.category || '',
          quantity: item.quantity || 0,
          unitPrice: item.unitPrice || item.unit_price || 0,
          total: item.total || item.totalAmount || (item.quantity * (item.unitPrice || item.unit_price || 0)) || 0,
          specs: item.specs || {}
        };
      });
    } catch (error) {
      console.error("Error parsing items:", error, itemsData);
      return [];
    }
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

      <PurchaseDetailsDialog
        purchase={selectedPurchase}
        open={!!selectedPurchase}
        onClose={closePurchaseDetailsDialog}
        formatDate={formatDate}
        getParsedItems={getParsedItems}
      />
    </>
  );
}
