
import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { Card, CardContent } from "@/components/ui/card";
import { useVendors } from "@/contexts/VendorContext";
import { Loader2 } from "lucide-react";
import { useInventoryItems } from "@/hooks/inventory/useInventoryItems";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";
import UnifiedPurchaseForm from "@/components/inventory/purchases/UnifiedPurchaseForm";
import PurchaseHeader from "@/components/inventory/purchases/PurchaseHeader";
import { useQueryClient } from "@tanstack/react-query";
import { purchaseOrderService } from "@/services/purchaseOrderService";

export type GstMode = 'no-gst' | 'exclusive' | 'inclusive';

export interface PurchaseItem {
  id: string;
  itemId?: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  category: string;
  isCustomItem: boolean;
  gstPercent: number;
  gstAmount: number;
  specs?: {
    brand?: string;
    partNumber?: string;
    minStock?: number;
    [key: string]: any;
  };
}

const UnifiedPurchase = () => {
  const [purchaseDate, setPurchaseDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [purchaseType, setPurchaseType] = useState<'cash' | 'credit'>('cash');
  const [gstMode, setGstMode] = useState<GstMode>('no-gst');
  const [gstRate, setGstRate] = useState<number>(18);
  
  const { vendors, loading: vendorsLoading } = useVendors();
  const { items: inventoryItems, isLoading: inventoryLoading } = useInventoryItems(null);
  const queryClient = useQueryClient();

  const categories = [...new Set(inventoryItems?.map(item => item.category))];

  const savePurchase = async (
    items: PurchaseItem[], 
    vendorId: string, 
    vendorName: string,
    notes: string,
    purchaseType: 'cash' | 'credit',
    invoiceNumber: string,
    dueDate?: string
  ) => {
    if (items.length === 0) {
      toast.error("Please add at least one item to the purchase");
      return;
    }

    if (purchaseType === 'credit' && !dueDate) {
      toast.error("Please select a due date for credit purchase");
      return;
    }

    try {
      setIsLoading(true);

      // Calculate totals
      const subtotal = items.reduce((sum, item) => sum + (item.totalAmount), 0);
      const totalGst = items.reduce((sum, item) => sum + (item.gstAmount || 0), 0);
      const grandTotal = subtotal + totalGst;

      // Generate a purchase order number
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const randomString = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      const poNumber = `PO-${year}${month}${day}-${randomString}`;

      console.log("Saving purchase order with data:", {
        poNumber,
        vendorId,
        vendorName,
        items,
        subtotal,
        totalGst,
        grandTotal,
        deliveryDate: purchaseDate,
        status: purchaseType === 'cash' ? 'Cash Purchase' : 'Credit Purchase',
        notes,
        invoice_number: invoiceNumber,
        due_date: dueDate || null,
        payment_status: purchaseType === 'cash' ? 'Paid' : 'Due',
        payment_method: purchaseType === 'cash' ? 'Cash' : 'Credit'
      });

      // Create purchase record in database
      const { data, error } = await supabase
        .from('purchase_orders')
        .insert({
          po_number: poNumber,
          vendor_id: vendorId || null,
          vendor_name: vendorName,
          items: JSON.stringify(items),
          subtotal: subtotal,
          total_gst: totalGst,
          grand_total: grandTotal,
          delivery_date: purchaseDate,
          status: purchaseType === 'cash' ? 'Cash Purchase' : 'Credit Purchase',
          notes: notes,
          invoice_number: invoiceNumber,
          due_date: dueDate || null,
          payment_status: purchaseType === 'cash' ? 'Paid' : 'Due',
          payment_method: purchaseType === 'cash' ? 'Cash' : 'Credit'
        })
        .select();

      if (error) {
        console.error("Error details:", error);
        throw error;
      }

      console.log("Purchase saved successfully:", data);

      // Update inventory quantities for each purchased item
      for (const item of items) {
        if (!item.isCustomItem && item.itemId) {
          // Get current stock entry
          const { data: currentItem, error: fetchError } = await supabase
            .from('opening_stock_entries')
            .select('quantity')
            .eq('id', item.itemId)
            .single();
            
          if (fetchError) {
            console.error("Error fetching current inventory:", fetchError);
            continue;
          }
            
          // Update existing inventory item quantity
          const newQuantity = (currentItem?.quantity || 0) + item.quantity;
          
          const { error: updateError } = await supabase
            .from('opening_stock_entries')
            .update({ 
              quantity: newQuantity 
            })
            .eq('id', item.itemId);

          if (updateError) {
            console.error("Error updating inventory:", updateError);
          } else {
            console.log(`Updated inventory for item ${item.itemName} to quantity ${newQuantity}`);
          }
        } else if (item.isCustomItem) {
          // For new items, add them to inventory
          const newItem = {
            part_name: item.itemName,
            category: item.category,
            quantity: item.quantity,
            purchase_price: item.unitPrice,
            min_stock: item.specs?.minStock || 5,
            brand: item.specs?.brand || "Generic",
            part_number: item.specs?.partNumber || "",
            full_item_name: item.itemName
          };
          
          console.log("Adding new item to inventory:", newItem);
          
          const { data: insertedItem, error: insertError } = await supabase
            .from('opening_stock_entries')
            .insert(newItem)
            .select();

          if (insertError) {
            console.error("Error adding new item to inventory:", insertError);
          } else {
            console.log("New item added to inventory:", insertedItem);
          }
        }
      }

      // Invalidate queries to refresh inventory data
      queryClient.invalidateQueries({ queryKey: ['inventory_items'] });
      
      toast.success(`Purchase recorded successfully with ID: ${poNumber}`);
      return data;
    } catch (error: any) {
      console.error("Error saving purchase:", error);
      toast.error(`Failed to save purchase: ${error.message}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <Helmet>
        <title>{purchaseType === 'cash' ? 'Cash Purchase' : 'Credit Purchase'} | Inventory Management</title>
      </Helmet>

      <PurchaseHeader 
        date={purchaseDate} 
        onDateChange={setPurchaseDate}
        purchaseType={purchaseType}
        onPurchaseTypeChange={setPurchaseType}
      />

      <Tabs defaultValue="purchase-entry" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="purchase-entry">Purchase Entry</TabsTrigger>
          <TabsTrigger value="purchase-history">Purchase History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="purchase-entry">
          <Card>
            <CardContent className="p-6">
              {isLoading || vendorsLoading || inventoryLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
                  <span>Loading data...</span>
                </div>
              ) : (
                <UnifiedPurchaseForm
                  vendors={vendors}
                  inventoryItems={inventoryItems}
                  categories={categories}
                  onSave={savePurchase}
                  purchaseType={purchaseType}
                  gstMode={gstMode}
                  gstRate={gstRate}
                  onGstModeChange={setGstMode}
                  onGstRateChange={setGstRate}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="purchase-history">
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-8">
                <h3 className="text-lg font-medium">Purchase History</h3>
                <p className="text-muted-foreground">View and manage your purchase history here</p>
                <Button className="mt-4" variant="outline" onClick={() => toast.info("Purchase history feature will be implemented soon")}>
                  View All Purchases
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UnifiedPurchase;
