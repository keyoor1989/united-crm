
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
  // Query for engineer assignments
  const { data: engineerAssignments } = useQuery({
    queryKey: ['engineer_assignments', itemName],
    queryFn: async () => {
      if (!itemName) return [];
      const { data, error } = await supabase
        .from('engineer_inventory')
        .select('*')
        .eq('item_name', itemName)
        .order('assigned_date', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!itemName
  });

  // Query for sales history
  const { data: salesHistory } = useQuery({
    queryKey: ['sales_history', itemName],
    queryFn: async () => {
      if (!itemName) return [];
      const { data, error } = await supabase
        .from('sales_items')
        .select('*, sales!inner(*)')
        .eq('item_name', itemName)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!itemName
  });

  // Query for returns history
  const { data: returnsHistory } = useQuery({
    queryKey: ['returns_history', itemName],
    queryFn: async () => {
      if (!itemName) return [];
      const { data, error } = await supabase
        .from('inventory_returns')
        .select('*')
        .eq('item_name', itemName)
        .order('return_date', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!itemName
  });

  if (!itemName) return null;

  const formatDate = (date: string) => {
    try {
      return format(new Date(date), 'dd MMM yyyy');
    } catch (e) {
      return date;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Item History: {itemName}</DialogTitle>
          <DialogDescription>
            Complete transaction history showing engineer assignments, sales, and returns
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="engineer_assignments" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="engineer_assignments">Engineer Assignments</TabsTrigger>
            <TabsTrigger value="sales">Sales History</TabsTrigger>
            <TabsTrigger value="returns">Returns History</TabsTrigger>
          </TabsList>

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
                          <TableCell>{formatDate(sale.sales.date)}</TableCell>
                          <TableCell>{sale.sales.customer_name}</TableCell>
                          <TableCell>{sale.quantity}</TableCell>
                          <TableCell>₹{sale.unit_price}</TableCell>
                          <TableCell>₹{sale.total}</TableCell>
                          <TableCell>
                            <Badge variant={sale.sales.status === 'completed' ? 'success' : 'secondary'}>
                              {sale.sales.status}
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
