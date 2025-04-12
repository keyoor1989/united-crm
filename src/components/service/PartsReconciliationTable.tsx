
import React, { useState, useEffect } from "react";
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
import { fetchServiceCallsWithParts, updatePartReconciliation, updateServiceCallReconciliation } from "@/services/partsReconciliationService";

interface PartsReconciliationTableProps {
  serviceCalls?: ServiceCall[];
  onReconcile?: (serviceCallId: string, reconciled: boolean) => void;
  onPartReconcile?: (serviceCallId: string, partId: string, reconciled: boolean) => void;
}

const PartsReconciliationTable = ({ 
  serviceCalls: propServiceCalls, 
  onReconcile: propOnReconcile,
  onPartReconcile: propOnPartReconcile 
}: PartsReconciliationTableProps) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [serviceCalls, setServiceCalls] = useState<ServiceCall[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Use either the props or fetch from the database
  useEffect(() => {
    if (propServiceCalls) {
      setServiceCalls(propServiceCalls);
      setIsLoading(false);
    } else {
      fetchServiceCallsFromDB();
    }
  }, [propServiceCalls]);
  
  // Function to fetch service calls from the database
  const fetchServiceCallsFromDB = async () => {
    setIsLoading(true);
    try {
      const calls = await fetchServiceCallsWithParts();
      setServiceCalls(calls);
    } catch (error) {
      console.error("Error fetching service calls:", error);
      toast({
        title: "Error",
        description: "Failed to load service calls. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle part reconciliation either through props or directly with the database
  const handlePartReconcile = async (serviceCallId: string, partId: string, reconciled: boolean) => {
    if (propOnPartReconcile) {
      propOnPartReconcile(serviceCallId, partId, reconciled);
    } else {
      const success = await updatePartReconciliation(serviceCallId, partId, reconciled);
      if (success) {
        // Update the local state to reflect the change
        setServiceCalls(prev => 
          prev.map(call => {
            if (call.id === serviceCallId) {
              const updatedParts = call.partsUsed.map(part => {
                if (part.id === partId) {
                  return { ...part, isReconciled: reconciled };
                }
                return part;
              });
              
              const allReconciled = updatedParts.every(part => part.isReconciled);
              
              return {
                ...call,
                partsUsed: updatedParts,
                partsReconciled: allReconciled
              };
            }
            return call;
          })
        );
        
        toast({
          title: reconciled ? "Part Reconciled" : "Part Unreconciled",
          description: `Part has been ${reconciled ? "reconciled" : "unreconciled"} successfully.`,
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to update part reconciliation status.",
          variant: "destructive",
        });
      }
    }
  };
  
  // Handle service call reconciliation either through props or directly with the database
  const handleReconcile = async (serviceCallId: string, reconciled: boolean) => {
    if (propOnReconcile) {
      propOnReconcile(serviceCallId, reconciled);
    } else {
      const success = await updateServiceCallReconciliation(serviceCallId, reconciled);
      if (success) {
        // Update the local state to reflect the change
        setServiceCalls(prev => 
          prev.map(call => {
            if (call.id === serviceCallId) {
              const updatedParts = call.partsUsed.map(part => ({
                ...part,
                isReconciled: reconciled
              }));
              
              return {
                ...call,
                partsUsed: updatedParts,
                partsReconciled: reconciled
              };
            }
            return call;
          })
        );
        
        toast({
          title: reconciled ? "Service Call Reconciled" : "Service Call Unreconciled",
          description: `All parts in the service call have been ${reconciled ? "reconciled" : "unreconciled"} successfully.`,
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to update service call reconciliation status.",
          variant: "destructive",
        });
      }
    }
  };
  
  // Handle bulk reconciliation of the next pending service call
  const handleBulkReconcile = async () => {
    if (pendingReconciliation.length === 0) {
      return;
    }
    
    // Reconcile all parts in the first service call from the list
    const serviceCall = pendingReconciliation[0];
    
    if (propOnReconcile) {
      propOnReconcile(serviceCall.id, true);
    } else {
      const success = await updateServiceCallReconciliation(serviceCall.id, true);
      if (success) {
        // Update the local state to reflect the change
        setServiceCalls(prev => 
          prev.map(call => {
            if (call.id === serviceCall.id) {
              const updatedParts = call.partsUsed.map(part => ({
                ...part,
                isReconciled: true
              }));
              
              return {
                ...call,
                partsUsed: updatedParts,
                partsReconciled: true
              };
            }
            return call;
          })
        );
        
        toast({
          title: "Parts Reconciled",
          description: `Parts for service call #${serviceCall.id.substring(0, 8)} have been reconciled`,
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to reconcile service call.",
          variant: "destructive",
        });
      }
    }
  };
  
  // Filter service calls that have parts and match search term
  const callsWithParts = serviceCalls.filter(call => 
    call.partsUsed && call.partsUsed.length > 0
  ).filter(call => 
    call.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (call.engineerName && call.engineerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    call.machineModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (call.serialNumber && call.serialNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
    call.partsUsed.some(part => part.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  console.log("Engineer names in PartsReconciliationTable:", serviceCalls.map(call => call.engineerName));
  console.log("Search term in PartsReconciliationTable:", searchTerm);
  
  const pendingReconciliation = callsWithParts.filter(call => !call.partsReconciled);
  const reconciled = callsWithParts.filter(call => call.partsReconciled);
  
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

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xl">Parts Reconciliation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <p>Loading reconciliation data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Parts Reconciliation</CardTitle>
          <div className="flex gap-2">
            <div className="relative w-60">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by customer, engineer or machine"
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
                          <div className="text-xs text-muted-foreground">{call.engineerName || "Unassigned"}</div>
                        </TableCell>
                        <TableCell>
                          <div>{call.machineModel}</div>
                          <div className="text-xs text-muted-foreground">S/N: {call.serialNumber || "N/A"}</div>
                        </TableCell>
                        <TableCell>
                          <div className="max-h-24 overflow-auto space-y-1">
                            {call.partsUsed.map(part => (
                              <div key={part.id} className="flex items-center gap-2 text-sm">
                                <Checkbox
                                  id={`${call.id}-${part.id}`}
                                  checked={part.isReconciled}
                                  onCheckedChange={(checked) => handlePartReconcile(call.id, part.id, !!checked)}
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
                            onClick={() => handleReconcile(call.id, true)}
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
                          <div className="text-xs text-muted-foreground">{call.engineerName || "Unassigned"}</div>
                        </TableCell>
                        <TableCell>
                          <div>{call.machineModel}</div>
                          <div className="text-xs text-muted-foreground">S/N: {call.serialNumber || "N/A"}</div>
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
                            onClick={() => handleReconcile(call.id, false)}
                          >
                            Unreconcile
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
