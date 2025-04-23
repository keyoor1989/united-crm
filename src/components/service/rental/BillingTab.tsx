
import React, { useState, useEffect } from 'react';
import { RentalMachine } from '@/types/finance';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/utils/finance/financeUtils';

interface BillingTabProps {
  selectedMachine: RentalMachine | null;
}

interface BillingRecord {
  id: string;
  billing_month: string;
  bill_date: string;
  a4_total_copies: number;
  a4_free_copies: number;
  a4_extra_copies: number;
  a4_extra_copy_charge: number;
  a3_total_copies: number;
  a3_free_copies: number;
  a3_extra_copies: number;
  a3_extra_copy_charge?: number;
  rent: number;
  total_bill: number;
  bill_status: string;
}

const BillingTab = ({ selectedMachine }: BillingTabProps) => {
  const [billingHistory, setBillingHistory] = useState<BillingRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBillingHistory = async () => {
      if (!selectedMachine) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('amc_billing')
          .select('*')
          .eq('machine_id', selectedMachine.id)
          .order('billing_month', { ascending: false });
        
        if (error) throw error;
        
        if (data) {
          // Map to BillingRecord type
          const mappedBilling = data.map((record): BillingRecord => ({
            id: record.id,
            billing_month: record.billing_month,
            bill_date: record.bill_date,
            a4_total_copies: record.a4_total_copies,
            a4_free_copies: record.a4_free_copies,
            a4_extra_copies: record.a4_extra_copies,
            a4_extra_copy_charge: record.a4_extra_copy_charge,
            a3_total_copies: record.a3_total_copies || 0,
            a3_free_copies: record.a3_free_copies || 0,
            a3_extra_copies: record.a3_extra_copies || 0,
            a3_extra_copy_charge: record.a3_extra_copy_charge || 0,
            rent: record.rent,
            total_bill: record.total_bill,
            bill_status: record.bill_status
          }));
          setBillingHistory(mappedBilling);
        }
      } catch (err) {
        console.error('Error fetching billing history:', err);
        setError(err instanceof Error ? err.message : 'Failed to load billing history');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBillingHistory();
  }, [selectedMachine]);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy');
    } catch (e) {
      return dateString;
    }
  };

  const formatMonth = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM yyyy');
    } catch (e) {
      return dateString;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Billing History</CardTitle>
        <CardDescription>
          {selectedMachine ? 
            `Billing history for ${selectedMachine.model} (${selectedMachine.serialNumber})` :
            "Select a machine to view billing history"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Month</TableHead>
                <TableHead>Billing Date</TableHead>
                <TableHead>A4 Copies</TableHead>
                <TableHead>A3 Copies</TableHead>
                <TableHead>Extra Copies</TableHead>
                <TableHead>Base Rent</TableHead>
                <TableHead>Extra Charges</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9}>
                    <div className="flex flex-col gap-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-red-500">
                    Error loading data: {error}
                  </TableCell>
                </TableRow>
              ) : billingHistory.length > 0 ? (
                billingHistory.map((bill) => (
                  <TableRow key={bill.id}>
                    <TableCell>{formatMonth(bill.billing_month)}</TableCell>
                    <TableCell>{formatDate(bill.bill_date)}</TableCell>
                    <TableCell>{bill.a4_total_copies.toLocaleString()}</TableCell>
                    <TableCell>{bill.a3_total_copies.toLocaleString()}</TableCell>
                    <TableCell>
                      {(bill.a4_extra_copies + bill.a3_extra_copies).toLocaleString()}
                    </TableCell>
                    <TableCell>{formatCurrency(bill.rent)}</TableCell>
                    <TableCell>{formatCurrency(bill.a4_extra_copy_charge + (bill.a3_extra_copy_charge || 0))}</TableCell>
                    <TableCell>{formatCurrency(bill.total_bill)}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          bill.bill_status === "Paid" ? "success" : 
                          bill.bill_status === "Partial" ? "warning" : 
                          "destructive"
                        }
                      >
                        {bill.bill_status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="text-center h-24">
                    {selectedMachine ? 
                      "No billing history found" : 
                      "Select a machine to view billing history"}
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

export default BillingTab;
