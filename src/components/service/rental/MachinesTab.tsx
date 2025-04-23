
import React from 'react';
import { RentalMachine } from '@/types/finance';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FilePlus, Settings, Printer, FileSpreadsheet, Plus, CircleSlash } from 'lucide-react';
import { format } from 'date-fns';
import { formatCurrency } from '@/utils/finance/financeUtils';
import { Skeleton } from '@/components/ui/skeleton';

interface MachinesTabProps {
  machines: RentalMachine[];
  onAddReading: (machine: RentalMachine) => void;
  onViewParts: (machine: RentalMachine) => void;
  onAddParts: (machine: RentalMachine) => void;
  onGenerateBill: (machine: RentalMachine) => void;
  onPrintContract: (machine: RentalMachine) => void;
  isLoading?: boolean;
}

const MachinesTab = ({
  machines,
  onAddReading,
  onViewParts,
  onAddParts,
  onGenerateBill,
  onPrintContract,
  isLoading = false,
}: MachinesTabProps) => {
  const formatDateString = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "dd/MM/yyyy");
    } catch (e) {
      return dateStr;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Rental Machines</CardTitle>
          <CardDescription>Loading machines...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Serial Number</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Contract Period</TableHead>
                  <TableHead>Monthly Rent</TableHead>
                  <TableHead>Last Reading</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[1, 2, 3].map((index) => (
                  <TableRow key={index}>
                    <TableCell colSpan={9}>
                      <Skeleton className="h-12 w-full" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rental Machines</CardTitle>
        <CardDescription>View and manage all rental machines</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Serial Number</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Contract Period</TableHead>
                <TableHead>Monthly Rent</TableHead>
                <TableHead>Last Reading</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {machines.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center h-24">
                    No machines found
                  </TableCell>
                </TableRow>
              ) : (
                machines.map((machine) => (
                  <TableRow key={machine.id}>
                    <TableCell>{machine.serialNumber}</TableCell>
                    <TableCell>{machine.model}</TableCell>
                    <TableCell>{machine.clientName}</TableCell>
                    <TableCell>{machine.location}</TableCell>
                    <TableCell>
                      {formatDateString(machine.startDate)} - 
                      {formatDateString(machine.endDate)}
                    </TableCell>
                    <TableCell>{formatCurrency(machine.monthlyRent)}</TableCell>
                    <TableCell>
                      <div className="text-xs">
                        A4: {machine.currentA4Reading.toLocaleString()}
                      </div>
                      <div className="text-xs">
                        A3: {machine.currentA3Reading.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {machine.lastReadingDate ? formatDateString(machine.lastReadingDate) : 'No readings'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={machine.status === "Active" ? "default" : 
                               machine.status === "Inactive" ? "secondary" : "destructive"}
                      >
                        {machine.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => onAddReading(machine)}
                          title="Add Reading"
                        >
                          <FilePlus className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => onViewParts(machine)}
                          title="View Parts"
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => onAddParts(machine)}
                          title="Add Parts"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => onGenerateBill(machine)}
                          title="Generate Bill"
                        >
                          <FileSpreadsheet className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => onPrintContract(machine)}
                          title="Print Contract"
                        >
                          <Printer className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default MachinesTab;
