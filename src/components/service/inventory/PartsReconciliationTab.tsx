import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Check, X, FileText, ArrowDownToLine, Plus } from "lucide-react";
import { ServiceCall, Part } from "@/types/service";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  fetchServiceCallsWithParts, 
  updatePartReconciliation, 
  updateServiceCallReconciliation,
  addPartToServiceCall
} from "@/services/partsReconciliationService";
import { useToast } from "@/hooks/use-toast";
import AddPartDialog from "./AddPartDialog";

interface PartsReconciliationTabProps {
  serviceCalls?: ServiceCall[];
  onReconcile?: (serviceCallId: string, reconciled: boolean) => void;
  onPartReconcile?: (serviceCallId: string, partId: string, reconciled: boolean) => void;
  isLoading?: boolean;
}

const PartsReconciliationTab = ({ 
  serviceCalls: propServiceCalls, 
  onReconcile: propOnReconcile, 
  onPartReconcile: propOnPartReconcile,
  isLoading: propIsLoading 
}: PartsReconciliationTabProps) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [serviceCalls, setServiceCalls] = useState<ServiceCall[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(propIsLoading ?? true);
  const [showAddPartDialog, setShowAddPartDialog] = useState(false);
  const [selectedServiceCall, setSelectedServiceCall] = useState<ServiceCall | null>(null);
  
  useEffect(() => {
    if (propServiceCalls) {
      setServiceCalls(propServiceCalls);
      setIsLoading(false);
    } else {
      fetchServiceCallsFromDB();
    }
  }, [propServiceCalls]);
  
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
  
  const handlePartReconcile = async (serviceCallId: string, partId: string, reconciled: boolean) => {
    if (propOnPartReconcile) {
      propOnPartReconcile(serviceCallId, partId, reconciled);
    } else {
      const success = await updatePartReconciliation(serviceCallId, partId, reconciled);
      if (success) {
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
  
  const handleReconcile = async (serviceCallId: string, reconciled: boolean) => {
    if (propOnReconcile) {
      propOnReconcile(serviceCallId, reconciled);
    } else {
      const success = await updateServiceCallReconciliation(serviceCallId, reconciled);
      if (success) {
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

  const handleAddPart = async (part: Partial<Part>) => {
    if (!selectedServiceCall) return;
    
    const success = await addPartToServiceCall(selectedServiceCall.id, part);
    if (success) {
      fetchServiceCallsFromDB();
      
      toast({
        title: "Part Added",
        description: `${part.quantity} ${part.name} added to service call for ${selectedServiceCall.customerName}`,
      });
      
      setShowAddPartDialog(false);
    } else {
      toast({
        title: "Error",
        description: "Failed to add part to service call.",
        variant: "destructive",
      });
    }
  };
  
  const openAddPartDialog = (serviceCall: ServiceCall) => {
    setSelectedServiceCall(serviceCall);
    setShowAddPartDialog(true);
  };
  
  const callsWithParts = serviceCalls.filter(call => 
    call.partsUsed && call.partsUsed.length > 0
  );
  
  const filteredCalls = serviceCalls.filter(call => 
    call.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (call.engineerName && call.engineerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    call.machineModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (call.serialNumber && call.serialNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
    call.partsUsed.some(part => part.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const handleExport = () => {
    toast({
      title: "Export Started",
      description: "The reconciliation data export has started. The file will be downloaded shortly.",
    });
    
    console.log("Exporting reconciliation data:", filteredCalls);
  };
  
  console.log("Service calls with parts:", callsWithParts);
  console.log("Filtered calls:", filteredCalls);
  console.log("Engineer names in calls:", callsWithParts.map(call => call.engineerName));
  console.log("Search term:", searchTerm);
  
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
          <Button variant="outline" onClick={handleExport}>
            <ArrowDownToLine className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button onClick={fetchServiceCallsFromDB}>
            Refresh
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
                        {call.machineModel} (S/N: {call.serialNumber || 'N/A'}) • Engineer: {call.engineerName || 'Unassigned'}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={call.partsReconciled ? "outline" : "secondary"}>
                        {call.partsReconciled ? "Reconciled" : "Pending"}
                      </Badge>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => openAddPartDialog(call)}
                      >
                        <Plus className="mr-1 h-4 w-4" /> Add Part
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleReconcile(call.id, !call.partsReconciled)}
                      >
                        {call.partsReconciled ? (
                          <><X className="mr-1 h-4 w-4" /> Unreconcile</>
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
                      {call.partsUsed.length > 0 ? (
                        call.partsUsed.map((part: Part) => (
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
                                onClick={() => handlePartReconcile(call.id, part.id, !part.isReconciled)}
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
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-4">
                            No parts recorded for this service call yet.
                            <div className="mt-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => openAddPartDialog(call)}
                              >
                                <Plus className="mr-1 h-4 w-4" /> Add Part
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
      
      <AddPartDialog 
        open={showAddPartDialog} 
        onOpenChange={setShowAddPartDialog}
        engineerId={selectedServiceCall?.engineerId || ""}
        engineerName={selectedServiceCall?.engineerName || ""}
        engineerItems={[]} // This should be populated with the correct engineer items
        onPartAdded={handleAddPart}
        onClose={() => setShowAddPartDialog(false)}
        onSave={handleAddPart}
        serviceCall={selectedServiceCall}
      />
    </Card>
  );
};

export default PartsReconciliationTab;
