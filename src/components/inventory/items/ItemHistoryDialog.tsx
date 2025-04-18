
import React from 'react';
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface ItemHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemName: string | null;
}

export const ItemHistoryDialog = ({ open, onOpenChange, itemName }: ItemHistoryDialogProps) => {
  // Query for engineer assignments with LIKE query
  const { data: engineerAssignments } = useQuery({
    queryKey: ['engineer_assignments', itemName],
    queryFn: async () => {
      if (!itemName) return [];
      
      // Use ILIKE for case-insensitive partial matching
      const { data, error } = await supabase
        .from('engineer_inventory')
        .select('*')
        .or(`item_name.ilike.%${itemName}%,item_name.eq.${itemName}`)
        .order('assigned_date', { ascending: false });
      
      if (error) {
        console.error('Engineer assignments error:', error);
        throw error;
      }
      console.log('Engineer assignments:', data);
      return data;
    },
    enabled: !!itemName
  });

  // Query for sales history with improved matching
  const { data: salesHistory, isLoading: isSalesLoading, error: salesError } = useQuery({
    queryKey: ['sales_history', itemName],
    queryFn: async () => {
      if (!itemName) return [];
      console.log('Fetching sales history for item:', itemName);
      
      // First find all sales_items that match our item name with ILIKE
      const { data: salesItemsData, error: salesItemsError } = await supabase
        .from('sales_items')
        .select('id, sale_id, item_name, quantity, unit_price, total')
        .or(`item_name.ilike.%${itemName}%,item_name.eq.${itemName}`);
      
      if (salesItemsError) {
        console.error("Error fetching sales items:", salesItemsError);
        throw salesItemsError;
      }
      
      if (!salesItemsData || salesItemsData.length === 0) {
        console.log('No sales items found for:', itemName);
        return [];
      }
      
      console.log('Found sales items:', salesItemsData);
      
      // Extract all sale_ids to fetch the corresponding sales records
      const saleIds = salesItemsData.map(item => item.sale_id);
      
      // Fetch the sales records
      const { data: salesData, error: salesError } = await supabase
        .from('sales')
        .select('id, date, customer_name, status, payment_status')
        .in('id', saleIds);
      
      if (salesError) {
        console.error("Error fetching sales:", salesError);
        throw salesError;
      }
      
      // Combine the data from both tables
      const combinedData = salesItemsData.map(item => {
        const saleRecord = salesData.find(sale => sale.id === item.sale_id);
        return {
          id: item.id,
          item_name: item.item_name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total: item.total,
          sales: saleRecord || { date: null, customer_name: 'Unknown', status: 'unknown' }
        };
      });
      
      console.log('Combined sales history data:', combinedData);
      return combinedData;
    },
    enabled: !!itemName
  });

  // Query for returns history with improved matching
  const { data: returnsHistory } = useQuery({
    queryKey: ['returns_history', itemName],
    queryFn: async () => {
      if (!itemName) return [];
      const { data, error } = await supabase
        .from('inventory_returns')
        .select('*')
        .or(`item_name.ilike.%${itemName}%,item_name.eq.${itemName}`)
        .order('return_date', { ascending: false });
      
      if (error) throw error;
      console.log('Returns history:', data);
      return data;
    },
    enabled: !!itemName
  });

  // Query for purchase history from purchase orders with improved matching
  const { data: purchaseHistory } = useQuery({
    queryKey: ['purchase_history', itemName],
    queryFn: async () => {
      if (!itemName) return [];
      const { data, error } = await supabase
        .from('purchase_orders')
        .select('*')
        .contains('items', [{ item_name: itemName }])
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Extract relevant purchase information for the specific item
      const purchases = data?.map(po => {
        const itemsArray = typeof po.items === 'string' ? JSON.parse(po.items) : po.items;
        const itemDetails = Array.isArray(itemsArray) 
          ? itemsArray.find((item: any) => {
              const itemNameMatch = item.item_name === itemName ||
                                  item.item_name.includes(itemName) ||
                                  itemName.includes(item.item_name);
              return itemNameMatch;
            })
          : null;
          
        if (!itemDetails) return null;
        
        return {
          id: po.id,
          date: po.created_at,
          vendor: po.vendor_name,
          quantity: itemDetails?.quantity || 0,
          rate: itemDetails?.unit_price || 0,
          invoiceNo: po.po_number
        };
      }).filter(Boolean) || [];
      
      console.log('Purchase history:', purchases);
      return purchases;
    },
    enabled: !!itemName
  });

  if (!itemName) return null;

  const formatDate = (date: string) => {
    if (!date) return 'N/A';
    try {
      return format(new Date(date), 'dd MMM yyyy');
    } catch (e) {
      return date || 'N/A';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Item History: {itemName}</DialogTitle>
          <DialogDescription>
            Complete transaction history showing purchases, engineer assignments, sales, and returns
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="purchase_history" className="mt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="purchase_history">Purchase History</TabsTrigger>
            <TabsTrigger value="engineer_assignments">Engineer Assignments</TabsTrigger>
            <TabsTrigger value="sales">Sales History</TabsTrigger>
            <TabsTrigger value="returns">Returns History</TabsTrigger>
          </TabsList>

          <TabsContent value="purchase_history">
            <Card>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Rate (₹)</TableHead>
                      <TableHead>PO Number</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {purchaseHistory && purchaseHistory.length > 0 ? (
                      purchaseHistory.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell>{formatDate(record.date)}</TableCell>
                          <TableCell>{record.vendor}</TableCell>
                          <TableCell className="text-right">{record.quantity}</TableCell>
                          <TableCell className="text-right">₹{record.rate.toLocaleString()}</TableCell>
                          <TableCell>{record.invoiceNo}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                          No purchase history found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="engineer_assignments">
            <Card>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Engineer</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Warehouse</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {engineerAssignments && engineerAssignments.length > 0 ? (
                      engineerAssignments.map((assignment) => (
                        <TableRow key={assignment.id}>
                          <TableCell>{formatDate(assignment.assigned_date)}</TableCell>
                          <TableCell>{assignment.engineer_name}</TableCell>
                          <TableCell>{assignment.quantity}</TableCell>
                          <TableCell>{assignment.warehouse_source}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                          No engineer assignments found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sales">
            <Card>
              <CardContent className="pt-6">
                {isSalesLoading ? (
                  <div className="text-center py-4">Loading sales data...</div>
                ) : salesError ? (
                  <div className="text-center py-4 text-red-500">
                    Error loading sales data. Please try again.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Unit Price</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {salesHistory && salesHistory.length > 0 ? (
                        salesHistory.map((sale) => (
                          <TableRow key={sale.id}>
                            <TableCell>{formatDate(sale.sales?.date)}</TableCell>
                            <TableCell>{sale.sales?.customer_name || 'Unknown'}</TableCell>
                            <TableCell>{sale.quantity}</TableCell>
                            <TableCell>₹{sale.unit_price}</TableCell>
                            <TableCell>₹{sale.total}</TableCell>
                            <TableCell>
                              <Badge variant={sale.sales?.status === 'completed' ? 'success' : 'secondary'}>
                                {sale.sales?.status || 'Pending'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                            No sales history found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="returns">
            <Card>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Engineer</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Condition</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {returnsHistory && returnsHistory.length > 0 ? (
                      returnsHistory.map((return_item) => (
                        <TableRow key={return_item.id}>
                          <TableCell>{formatDate(return_item.return_date)}</TableCell>
                          <TableCell>{return_item.engineer_name}</TableCell>
                          <TableCell>{return_item.quantity}</TableCell>
                          <TableCell>
                            <Badge 
                              variant={return_item.condition === 'Good' ? 'success' : 'destructive'}
                            >
                              {return_item.condition}
                            </Badge>
                          </TableCell>
                          <TableCell>{return_item.reason}</TableCell>
                          <TableCell>{return_item.notes || '-'}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                          No returns history found
                        </TableCell>
                      </TableRow>
                    )}
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
