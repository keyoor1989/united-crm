
import React, { useState, useEffect } from 'react';
import { RentalMachine } from '@/types/finance';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

interface PartsTabProps {
  selectedMachine: RentalMachine | null;
}

interface PartUsage {
  id: string;
  date: string;
  item_name: string;
  quantity: number;
  machine_model: string;
  cost: number;
  engineer_name: string | null;
  remarks: string | null;
}

const PartsTab = ({ selectedMachine }: PartsTabProps) => {
  const [partsHistory, setPartsHistory] = useState<PartUsage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPartsHistory = async () => {
      if (!selectedMachine) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('amc_consumable_usage')
          .select('*')
          .eq('machine_id', selectedMachine.id)
          .order('date', { ascending: false });
        
        if (error) throw error;
        
        setPartsHistory(data || []);
      } catch (err) {
        console.error('Error fetching parts history:', err);
        setError(err instanceof Error ? err.message : 'Failed to load parts history');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPartsHistory();
  }, [selectedMachine]);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy');
    } catch (e) {
      return dateString;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Parts Usage</CardTitle>
        <CardDescription>
          {selectedMachine ? 
            `Parts used for ${selectedMachine.model} (${selectedMachine.serialNumber})` :
            "Select a machine to view parts usage"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Part Name</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Technician</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <div className="flex flex-col gap-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-red-500">
                    Error loading data: {error}
                  </TableCell>
                </TableRow>
              ) : partsHistory.length > 0 ? (
                partsHistory.map((part) => (
                  <TableRow key={part.id}>
                    <TableCell>{formatDate(part.date)}</TableCell>
                    <TableCell>{part.item_name}</TableCell>
                    <TableCell>{part.quantity}</TableCell>
                    <TableCell>₹{part.cost.toLocaleString()}</TableCell>
                    <TableCell>{part.engineer_name || '-'}</TableCell>
                    <TableCell>{part.remarks || '-'}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24">
                    {selectedMachine ? 
                      "No parts usage history found" : 
                      "Select a machine to view parts usage"}
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

export default PartsTab;
