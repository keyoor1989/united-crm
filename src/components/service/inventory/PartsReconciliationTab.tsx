
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Check, X, FileText, ArrowDownToLine } from "lucide-react";
import { ServiceCall, Part } from "@/types/service";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PartsReconciliationTabProps {
  serviceCalls: ServiceCall[];
  onReconcile: (serviceCallId: string, reconciled: boolean) => void;
  onPartReconcile: (serviceCallId: string, partId: string, reconciled: boolean) => void;
  isLoading: boolean;
}

const PartsReconciliationTab = ({ 
  serviceCalls, 
  onReconcile, 
  onPartReconcile,
  isLoading 
}: PartsReconciliationTabProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Filter service calls with parts
  const callsWithParts = serviceCalls.filter(call => 
    call.partsUsed && call.partsUsed.length > 0
  );
  
  // Filter based on search term
  const filteredCalls = callsWithParts.filter(call => 
    call.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    call.engineerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    call.machineModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
    call.partsUsed.some(part => part.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Loading reconciliation data...</p>
      </div>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Parts Reconciliation</CardTitle>
        <CardDescription>
          Reconcile parts used by engineers on service calls with warehouse inventory
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <Alert className="mb-4">
          <AlertDescription>
            This is the final step in the inventory flow. After engineers use parts on service calls, 
            reconcile them here to update the main inventory records.
          </AlertDescription>
        </Alert>
        
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by customer, engineer, machine or part..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline">
            <ArrowDownToLine className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
        
        {filteredCalls.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="mx-auto h-12 w-12 mb-2 text-muted-foreground/50" />
            <p>No service calls with parts to reconcile.</p>
            <p className="text-sm">When engineers use parts on service calls, they will appear here for reconciliation.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredCalls.map((call) => (
              <Card key={call.id} className="overflow-hidden">
                <CardHeader className="bg-muted/50 py-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{call.customerName}</h3>
                      <p className="text-sm text-muted-foreground">
                        {call.machineModel} (S/N: {call.serialNumber || 'N/A'}) • Engineer: {call.engineerName}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={call.partsReconciled ? "outline" : "secondary"}>
                        {call.partsReconciled ? "Reconciled" : "Pending"}
                      </Badge>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => onReconcile(call.id, !call.partsReconciled)}
                      >
                        {call.partsReconciled ? (
                          <><X className="mr-1 h-4 w-4" /> Unreconcilepill</>
                        ) : (
                          <><Check className="mr-1 h-4 w-4" /> Reconcile All</>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-muted/30">
                      <TableRow>
                        <TableHead>Part Name</TableHead>
                        <TableHead>Part Number</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                        <TableHead className="text-right">Unit Price</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="text-right">Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {call.partsUsed.map((part: Part) => (
                        <TableRow key={part.id}>
                          <TableCell className="font-medium">{part.name}</TableCell>
                          <TableCell>{part.partNumber}</TableCell>
                          <TableCell className="text-right">{part.quantity}</TableCell>
                          <TableCell className="text-right">₹{part.price.toFixed(2)}</TableCell>
                          <TableCell className="text-right">₹{(part.quantity * part.price).toFixed(2)}</TableCell>
                          <TableCell className="text-right">
                            <Badge variant={part.isReconciled ? "outline" : "secondary"}>
                              {part.isReconciled ? "Reconciled" : "Pending"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onPartReconcile(call.id, part.id, !part.isReconciled)}
                            >
                              {part.isReconciled ? (
                                <X className="h-4 w-4" />
                              ) : (
                                <Check className="h-4 w-4" />
                              )}
                              <span className="sr-only">
                                {part.isReconciled ? "Unreconcile" : "Reconcile"}
                              </span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PartsReconciliationTab;
