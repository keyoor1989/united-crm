
import React from 'react';
import { RentalMachine } from '@/types/finance';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface PartsTabProps {
  selectedMachine: RentalMachine | null;
}

const PartsTab = ({ selectedMachine }: PartsTabProps) => {
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
                <TableHead>Reading</TableHead>
                <TableHead>Expected Life</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Technician</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={8} className="text-center h-24">
                  {selectedMachine ? 
                    "No parts usage history found" : 
                    "Select a machine to view parts usage"}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default PartsTab;
