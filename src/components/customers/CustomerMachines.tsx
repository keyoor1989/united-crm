import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Printer, CalendarDays, Settings, CalendarClock, DollarSign, PhoneCall } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useParams } from "react-router-dom";

type FollowUp = {
  date: Date;
  notes: string;
  type: "service" | "sales";
  status?: "pending" | "completed";
};

type Machine = {
  id: number;
  model: string;
  serialNumber: string;
  installationDate: string;
  status: "active" | "maintenance" | "replacement-due";
  lastService: string;
  followUp?: FollowUp;
};

type SalesFollowUp = {
  id: number;
  date: Date;
  customerId: number;
  customerName: string;
  notes: string;
  status: "pending" | "completed";
  type: "quotation" | "demo" | "negotiation" | "closure";
};

interface MachineFormData {
  model: string;
  serialNumber: string;
  machineType: string;
  installationDate: string;
  status: "active" | "maintenance" | "replacement-due";
}

export default function CustomerMachines() {
  const { id: customerId } = useParams<{ id: string }>();
  const [machines, setMachines] = useState<Machine[]>([]);
  const [salesFollowUps, setSalesFollowUps] = useState<SalesFollowUp[]>([]);
  const [followUpMachine, setFollowUpMachine] = useState<Machine | null>(null);
  const [followUpDate, setFollowUpDate] = useState<Date | undefined>(undefined);
  const [followUpNotes, setFollowUpNotes] = useState("");
  const [followUpDialogOpen, setFollowUpDialogOpen] = useState(false);
  const [salesFollowUpDialogOpen, setSalesFollowUpDialogOpen] = useState(false);
  const [addMachineDialogOpen, setAddMachineDialogOpen] = useState(false);
  const [newMachineData, setNewMachineData] = useState<MachineFormData>({
    model: "",
    serialNumber: "",
    machineType: "copier",
    installationDate: new Date().toISOString().split('T')[0],
    status: "active"
  });
  const [isLoading, setIsLoading] = useState(false);
  
  const [newSalesFollowUp, setNewSalesFollowUp] = useState<{
    date?: Date;
    customerName?: string;
    notes?: string;
    status: "pending" | "completed";
    type: "quotation" | "demo" | "negotiation" | "closure";
  }>({
    status: "pending",
    type: "quotation"
  });
  const [activeTab, setActiveTab] = useState("machines");

  useEffect(() => {
    if (customerId) {
      fetchCustomerMachines(customerId);
    }
  }, [customerId]);

  const fetchCustomerMachines = async (custId: string) => {
    try {
      const { data, error } = await supabase
        .from('customer_machines')
        .select('*')
        .eq('customer_id', custId);
        
      if (error) {
        console.error("Error fetching machines:", error);
        toast.error("Failed to load customer machines");
        return;
      }
      
      if (data && data.length > 0) {
        const transformedMachines: Machine[] = data.map((machine, index) => ({
          id: index + 1,
          model: machine.machine_name,
          serialNumber: machine.machine_serial || `SN${Math.floor(Math.random() * 1000000)}`,
          installationDate: machine.installation_date || new Date().toISOString().split('T')[0],
          status: "active",
          lastService: machine.last_service || new Date().toISOString().split('T')[0],
        }));
        
        setMachines(transformedMachines);
      } else {
        setMachines([]);
      }
    } catch (err) {
      console.error("Unexpected error fetching machines:", err);
      toast.error("An unexpected error occurred");
    }
  };

  const handleAddMachine = async () => {
    if (!newMachineData.model) {
      toast.error("Please enter a machine model");
      return;
    }
    
    if (!customerId) {
      toast.error("Customer ID is missing");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const machineData = {
        customer_id: customerId,
        machine_name: newMachineData.model,
        machine_type: newMachineData.machineType,
        machine_serial: newMachineData.serialNumber,
        installation_date: newMachineData.installationDate,
        status: newMachineData.status
      };
      
      const { data, error } = await supabase
        .from('customer_machines')
        .insert(machineData)
        .select();
        
      if (error) {
        console.error("Error adding machine:", error);
        toast.error("Failed to add machine: " + error.message);
        return;
      }
      
      toast.success("Machine added successfully!");
      
      setNewMachineData({
        model: "",
        serialNumber: "",
        machineType: "copier",
        installationDate: new Date().toISOString().split('T')[0],
        status: "active"
      });
      setAddMachineDialogOpen(false);
      
      if (customerId) {
        fetchCustomerMachines(customerId);
      }
      
    } catch (err) {
      console.error("Unexpected error adding machine:", err);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>;
      case "maintenance":
        return <Badge className="bg-amber-500">Maintenance Required</Badge>;
      case "replacement-due":
        return <Badge className="bg-red-500">Replacement Due</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  const getSalesTypeBadge = (type: string) => {
    switch (type) {
      case "quotation":
        return <Badge className="bg-blue-500">Quotation</Badge>;
      case "demo":
        return <Badge className="bg-purple-500">Demo</Badge>;
      case "negotiation":
        return <Badge className="bg-amber-500">Negotiation</Badge>;
      case "closure":
        return <Badge className="bg-green-500">Closure</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  const handleScheduleFollowUp = (machine: Machine) => {
    setFollowUpMachine(machine);
    setFollowUpDate(machine.followUp?.date);
    setFollowUpNotes(machine.followUp?.notes || "");
    setFollowUpDialogOpen(true);
  };

  const saveFollowUp = () => {
    if (!followUpMachine || !followUpDate) {
      toast.error("Please select a follow-up date");
      return;
    }

    const updatedMachines = machines.map(machine => {
      if (machine.id === followUpMachine.id) {
        return {
          ...machine,
          followUp: {
            date: followUpDate,
            notes: followUpNotes,
            type: "service" as const
          }
        };
      }
      return machine;
    });

    setMachines(updatedMachines);
    setFollowUpDialogOpen(false);
    toast.success(`Follow-up scheduled for ${format(followUpDate, "PPP")}`);
  };

  const handleAddSalesFollowUp = () => {
    if (!newSalesFollowUp.date || !newSalesFollowUp.customerName || !newSalesFollowUp.notes) {
      toast.error("Please fill all required fields");
      return;
    }

    const newFollowUp: SalesFollowUp = {
      id: salesFollowUps.length + 1,
      date: newSalesFollowUp.date,
      customerId: Math.floor(Math.random() * 1000) + 100,
      customerName: newSalesFollowUp.customerName,
      notes: newSalesFollowUp.notes,
      status: newSalesFollowUp.status,
      type: newSalesFollowUp.type
    };

    setSalesFollowUps([...salesFollowUps, newFollowUp]);
    setSalesFollowUpDialogOpen(false);
    toast.success(`Sales follow-up scheduled for ${format(newFollowUp.date, "PPP")}`);
    setNewSalesFollowUp({
      status: "pending",
      type: "quotation"
    });
  };

  const markSalesFollowUpComplete = (id: number) => {
    const updatedFollowUps = salesFollowUps.map(followUp => {
      if (followUp.id === id) {
        return {
          ...followUp,
          status: "completed" as const
        };
      }
      return followUp;
    });

    setSalesFollowUps(updatedFollowUps);
    toast.success("Follow-up marked as completed");
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-md">Customer Management</CardTitle>
        <div className="flex gap-2">
          {activeTab === "machines" && (
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 gap-1"
              onClick={() => setAddMachineDialogOpen(true)}
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Machine</span>
            </Button>
          )}
          {activeTab === "sales-followups" && (
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 gap-1"
              onClick={() => setSalesFollowUpDialogOpen(true)}
            >
              <Plus className="h-3.5 w-3.5" />
              <span>New Sales Follow-up</span>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="machines">Machines</TabsTrigger>
            <TabsTrigger value="sales-followups">Sales Follow-ups</TabsTrigger>
          </TabsList>
          
          <TabsContent value="machines">
            {machines.length > 0 ? (
              <div className="space-y-3">
                {machines.map((machine) => (
                  <div key={machine.id} className="border rounded-md p-3">
                    <div className="flex justify-between items-start">
                      <div className="flex gap-2 items-center">
                        <Printer className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <h4 className="font-medium">{machine.model}</h4>
                          <p className="text-xs text-muted-foreground">
                            SN: {machine.serialNumber}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(machine.status)}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <DropdownMenuItem>Service History</DropdownMenuItem>
                            <DropdownMenuItem>Log Service Call</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleScheduleFollowUp(machine)}>
                              Schedule Service Follow-up
                            </DropdownMenuItem>
                            <DropdownMenuItem>Schedule Maintenance</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-3 mt-3 text-xs">
                      <div className="flex items-center gap-1">
                        <CalendarDays className="h-3 w-3 text-muted-foreground" />
                        <span>Installed: {new Date(machine.installationDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Settings className="h-3 w-3 text-muted-foreground" />
                        <span>Last Service: {new Date(machine.lastService).toLocaleDateString()}</span>
                      </div>
                      {machine.followUp && (
                        <div className="flex items-center gap-1">
                          <CalendarClock className="h-3 w-3 text-blue-500" />
                          <span className="text-blue-600 font-medium">
                            Follow-up: {format(machine.followUp.date, "PPP")}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-40 border rounded-md border-dashed">
                <Printer className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-muted-foreground text-sm">No machines added yet</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="sales-followups">
            {salesFollowUps.length > 0 ? (
              <div className="space-y-3">
                {salesFollowUps.map((followUp) => (
                  <div key={followUp.id} className={`border rounded-md p-3 ${followUp.status === 'completed' ? 'bg-gray-50' : ''}`}>
                    <div className="flex justify-between items-start">
                      <div className="flex gap-2 items-center">
                        <DollarSign className={`h-4 w-4 ${followUp.status === 'completed' ? 'text-green-500' : 'text-blue-500'}`} />
                        <div>
                          <h4 className="font-medium">{followUp.customerName}</h4>
                          <p className="text-xs text-muted-foreground">
                            {format(followUp.date, "PPP")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getSalesTypeBadge(followUp.type)}
                        <Badge variant={followUp.status === 'completed' ? 'outline' : 'secondary'}>
                          {followUp.status === 'completed' ? 'Completed' : 'Pending'}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <DropdownMenuItem>Edit Follow-up</DropdownMenuItem>
                            {followUp.status !== 'completed' && (
                              <DropdownMenuItem onClick={() => markSalesFollowUpComplete(followUp.id)}>
                                Mark as Completed
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem>Reschedule</DropdownMenuItem>
                            <DropdownMenuItem>Cancel</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    
                    <div className="mt-2 text-sm">
                      <p>{followUp.notes}</p>
                    </div>
                    
                    <div className="flex justify-end mt-3">
                      <Button size="sm" variant="ghost" className="h-6 gap-1">
                        <PhoneCall className="h-3 w-3" />
                        <span className="text-xs">Call Now</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-40 border rounded-md border-dashed">
                <CalendarClock className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-muted-foreground text-sm">No sales follow-ups scheduled</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>

      <Dialog open={addMachineDialogOpen} onOpenChange={setAddMachineDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Machine</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="machine-model">Machine Model</Label>
              <Input
                id="machine-model"
                placeholder="Enter machine model"
                value={newMachineData.model}
                onChange={(e) => setNewMachineData({...newMachineData, model: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="machine-serial">Serial Number</Label>
              <Input
                id="machine-serial"
                placeholder="Enter serial number"
                value={newMachineData.serialNumber}
                onChange={(e) => setNewMachineData({...newMachineData, serialNumber: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="machine-type">Machine Type</Label>
              <Select
                value={newMachineData.machineType}
                onValueChange={(value) => setNewMachineData({...newMachineData, machineType: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select machine type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="copier">Copier</SelectItem>
                  <SelectItem value="printer">Printer</SelectItem>
                  <SelectItem value="scanner">Scanner</SelectItem>
                  <SelectItem value="mfp">MFP</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="installation-date">Installation Date</Label>
              <Input
                id="installation-date"
                type="date"
                value={newMachineData.installationDate}
                onChange={(e) => setNewMachineData({...newMachineData, installationDate: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="machine-status">Status</Label>
              <Select
                value={newMachineData.status}
                onValueChange={(value: any) => setNewMachineData({...newMachineData, status: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="maintenance">Maintenance Required</SelectItem>
                  <SelectItem value="replacement-due">Replacement Due</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setAddMachineDialogOpen(false)} variant="outline">Cancel</Button>
            <Button onClick={handleAddMachine} disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Machine"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={followUpDialogOpen} onOpenChange={setFollowUpDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Service Follow-up</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {followUpMachine && (
              <div className="flex items-center gap-2 mb-4">
                <Printer className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">{followUpMachine.model}</p>
                  <p className="text-xs text-muted-foreground">SN: {followUpMachine.serialNumber}</p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="followup-date">Follow-up Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !followUpDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarClock className="mr-2 h-4 w-4" />
                    {followUpDate ? format(followUpDate, "PPP") : <span>Select date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={followUpDate}
                    onSelect={setFollowUpDate}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="followup-notes">Notes</Label>
              <Textarea
                id="followup-notes"
                placeholder="Add details about this service follow-up"
                value={followUpNotes}
                onChange={(e) => setFollowUpNotes(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setFollowUpDialogOpen(false)} variant="outline">Cancel</Button>
            <Button onClick={saveFollowUp}>Save Follow-up</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={salesFollowUpDialogOpen} onOpenChange={setSalesFollowUpDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Sales Follow-up</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="customer-name">Customer Name</Label>
              <Input
                id="customer-name"
                placeholder="Enter customer name"
                value={newSalesFollowUp.customerName || ''}
                onChange={(e) => setNewSalesFollowUp({...newSalesFollowUp, customerName: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="followup-type">Follow-up Type</Label>
              <Select
                value={newSalesFollowUp.type}
                onValueChange={(value) => setNewSalesFollowUp({...newSalesFollowUp, type: value as any})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select follow-up type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quotation">Quotation</SelectItem>
                  <SelectItem value="demo">Demo</SelectItem>
                  <SelectItem value="negotiation">Negotiation</SelectItem>
                  <SelectItem value="closure">Closure</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="followup-date">Follow-up Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !newSalesFollowUp.date && "text-muted-foreground"
                    )}
                  >
                    <CalendarClock className="mr-2 h-4 w-4" />
                    {newSalesFollowUp.date ? format(newSalesFollowUp.date, "PPP") : <span>Select date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={newSalesFollowUp.date}
                    onSelect={(date) => setNewSalesFollowUp({...newSalesFollowUp, date})}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="followup-notes">Notes</Label>
              <Textarea
                id="followup-notes"
                placeholder="Add details about this sales follow-up"
                value={newSalesFollowUp.notes || ''}
                onChange={(e) => setNewSalesFollowUp({...newSalesFollowUp, notes: e.target.value})}
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setSalesFollowUpDialogOpen(false)} variant="outline">Cancel</Button>
            <Button onClick={handleAddSalesFollowUp}>Save Follow-up</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
