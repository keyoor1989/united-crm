
import React from 'react';
import { RentalMachine } from '@/types/finance';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface BillingTabProps {
  selectedMachine: RentalMachine | null;
}

const BillingTab = ({ selectedMachine }: BillingTabProps) => {
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
              <TableRow>
                <TableCell colSpan={9} className="text-center h-24">
                  {selectedMachine ? 
                    "No billing history found" : 
                    "Select a machine to view billing history"}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default BillingTab;
