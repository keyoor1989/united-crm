
import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ServiceCall, Part } from "@/types/service";
import { Check, FileCheck, FileX, Search } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface PartsReconciliationTableProps {
  serviceCalls: ServiceCall[];
  onReconcile: (serviceCallId: string, reconciled: boolean) => void;
  onPartReconcile: (serviceCallId: string, partId: string, reconciled: boolean) => void;
}

const PartsReconciliationTable = ({ 
  serviceCalls, 
  onReconcile,
  onPartReconcile 
}: PartsReconciliationTableProps) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  
  // Filter service calls that have parts and are not reconciled
  const callsWithParts = serviceCalls.filter(call => 
    call.partsUsed && call.partsUsed.length > 0
  ).filter(call => 
    call.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    call.machineModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
    call.serialNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const pendingReconciliation = callsWithParts.filter(call => !call.partsReconciled);
  const reconciled = callsWithParts.filter(call => call.partsReconciled);
  
  const handleBulkReconcile = () => {
    if (pendingReconciliation.length === 0) {
      return;
    }
    
    // Reconcile all parts in the first service call from the list
    const serviceCall = pendingReconciliation[0];
    onReconcile(serviceCall.id, true);
    
    toast({
      title: "Parts Reconciled",
      description: `Parts for service call #${serviceCall.id.substring(0, 8)} have been reconciled`,
    });
  };
  
  const calculateTotalPartsValue = (parts: Part[]): number => {
    return parts.reduce((total, part) => total + (part.price * part.quantity), 0);
  };
  
  const calculatePartsCost = (parts: Part[]): number => {
    return parts.reduce((total, part) => {
      const cost = part.cost || (part.price * 0.6); // Use cost if available, otherwise estimate as 60% of price
      return total + (cost * part.quantity);
    }, 0);
  };
  
  const calculateProfit = (parts: Part[]): number => {
    const revenue = calculateTotalPartsValue(parts);
    const cost = calculatePartsCost(parts);
    return revenue - cost;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle>Parts Reconciliation</CardTitle>
          <div className="flex gap-2">
            <div className="relative w-60">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by customer or machine"
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {pendingReconciliation.length > 0 && (
              <Button onClick={handleBulkReconcile}>
                <Check className="mr-1 h-4 w-4" /> 
                Reconcile Next
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium flex items-center">
              <FileX className="mr-2 h-4 w-4 text-destructive" />
              Pending Reconciliation
            </h3>
            <Badge variant="outline">{pendingReconciliation.length}</Badge>
          </div>
          
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Service Call</TableHead>
                  <TableHead>Machine</TableHead>
                  <TableHead>Parts Used</TableHead>
                  <TableHead className="text-right">Parts Value</TableHead>
                  <TableHead className="text-right">Parts Cost</TableHead>
                  <TableHead className="text-right">Profit</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingReconciliation.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      No pending reconciliations
                    </TableCell>
                  </TableRow>
                ) : (
                  pendingReconciliation.map(call => {
                    const totalPartsValue = calculateTotalPartsValue(call.partsUsed);
                    const totalPartsCost = calculatePartsCost(call.partsUsed);
                    const partsProfit = calculateProfit(call.partsUsed);
                    
                    return (
                      <TableRow key={call.id}>
                        <TableCell className="text-sm">
                          {format(new Date(call.createdAt), "dd/MM/yyyy")}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{call.customerName}</div>
                          <div className="text-xs text-muted-foreground">{call.issueType}</div>
                        </TableCell>
                        <TableCell>
                          <div>{call.machineModel}</div>
                          <div className="text-xs text-muted-foreground">S/N: {call.serialNumber}</div>
                        </TableCell>
                        <TableCell>
                          <div className="max-h-24 overflow-auto space-y-1">
                            {call.partsUsed.map(part => (
                              <div key={part.id} className="flex items-center gap-2 text-sm">
                                <Checkbox
                                  id={`${call.id}-${part.id}`}
                                  checked={part.isReconciled}
                                  onCheckedChange={(checked) => onPartReconcile(call.id, part.id, !!checked)}
                                />
                                <label htmlFor={`${call.id}-${part.id}`} className="text-sm cursor-pointer">
                                  {part.name} × {part.quantity}
                                </label>
                              </div>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ₹{totalPartsValue.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          ₹{totalPartsCost.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          <span className={partsProfit >= 0 ? "text-green-600" : "text-red-600"}>
                            ₹{partsProfit.toFixed(2)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button 
                            size="sm" 
                            onClick={() => onReconcile(call.id, true)}
                          >
                            Reconcile
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
          
          <div className="flex items-center justify-between mt-8">
            <h3 className="font-medium flex items-center">
              <FileCheck className="mr-2 h-4 w-4 text-green-600" />
              Reconciled
            </h3>
            <Badge variant="outline">{reconciled.length}</Badge>
          </div>
          
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Service Call</TableHead>
                  <TableHead>Machine</TableHead>
                  <TableHead>Parts Used</TableHead>
                  <TableHead className="text-right">Parts Value</TableHead>
                  <TableHead className="text-right">Parts Cost</TableHead>
                  <TableHead className="text-right">Profit</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reconciled.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      No reconciled service calls
                    </TableCell>
                  </TableRow>
                ) : (
                  reconciled.slice(0, 5).map(call => {
                    const totalPartsValue = calculateTotalPartsValue(call.partsUsed);
                    const totalPartsCost = calculatePartsCost(call.partsUsed);
                    const partsProfit = calculateProfit(call.partsUsed);
                    
                    return (
                      <TableRow key={call.id}>
                        <TableCell className="text-sm">
                          {format(new Date(call.createdAt), "dd/MM/yyyy")}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{call.customerName}</div>
                          <div className="text-xs text-muted-foreground">{call.issueType}</div>
                        </TableCell>
                        <TableCell>
                          <div>{call.machineModel}</div>
                          <div className="text-xs text-muted-foreground">S/N: {call.serialNumber}</div>
                        </TableCell>
                        <TableCell>
                          <div className="max-h-24 overflow-auto space-y-1">
                            {call.partsUsed.map(part => (
                              <div key={part.id} className="text-sm flex items-center gap-1">
                                <Check className="h-3 w-3 text-green-600" />
                                {part.name} × {part.quantity}
                              </div>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ₹{totalPartsValue.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          ₹{totalPartsCost.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          <span className={partsProfit >= 0 ? "text-green-600" : "text-red-600"}>
                            ₹{partsProfit.toFixed(2)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => onReconcile(call.id, false)}
                          >
                            Unrecouncile
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
                {reconciled.length > 5 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-2 text-sm text-muted-foreground">
                      {reconciled.length - 5} more reconciled service calls not shown
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PartsReconciliationTable;
