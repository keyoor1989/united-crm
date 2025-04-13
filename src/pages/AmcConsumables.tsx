
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  Printer,
  Plus,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  FileCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

// Define interfaces for our data
interface ConsumableUsage {
  id: string;
  date: string;
  customer_name: string;
  serial_number: string;
  machine_model: string;
  machine_type: string;
  department?: string;
  item_name: string;
  quantity: number;
  cost: number;
  engineer_name?: string;
  remarks?: string;
}

interface Contract {
  id: string;
  customer_name: string;
  machine_model: string;
  serial_number: string;
  start_date: string;
  end_date: string;
  monthly_rent: number;
  copy_limit_a4: number;
  extra_a4_copy_charge: number;
  contract_type: string;
  department?: string;
  status: string;
}

interface NewConsumableUsage {
  customer_id: string;
  customer_name: string;
  machine_id: string;
  contract_id: string;
  date: string;
  item_name: string;
  quantity: number;
  cost: number;
  engineer_name?: string;
  remarks?: string;
}

const AmcConsumables = () => {
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState("usage");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  
  const [consumableUsage, setConsumableUsage] = useState<ConsumableUsage[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [customers, setCustomers] = useState<string[]>([]);
  const [isLoadingUsage, setIsLoadingUsage] = useState(true);
  const [isLoadingContracts, setIsLoadingContracts] = useState(true);
  
  // Dialog state for adding new consumable usage
  const [isAddUsageDialogOpen, setIsAddUsageDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [newUsage, setNewUsage] = useState<NewConsumableUsage>({
    customer_id: "",
    customer_name: "",
    machine_id: "",
    contract_id: "",
    date: format(new Date(), 'yyyy-MM-dd'),
    item_name: "",
    quantity: 1,
    cost: 0,
    engineer_name: "",
    remarks: ""
  });
  const [customerContracts, setCustomerContracts] = useState<Contract[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch data on component mount
  useEffect(() => {
    fetchConsumableUsage();
    fetchContracts();
  }, []);

  // Fetch consumable usage data from Supabase
  const fetchConsumableUsage = async () => {
    setIsLoadingUsage(true);
    try {
      const { data, error } = await supabase
        .from('amc_consumable_usage')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        console.error("Error fetching consumable usage:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch consumable usage data."
        });
      } else {
        setConsumableUsage(data);
        
        // Extract unique customer names for the filter
        const uniqueCustomers = [...new Set(data.map(item => item.customer_name))];
        setCustomers(uniqueCustomers);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred."
      });
    } finally {
      setIsLoadingUsage(false);
    }
  };

  // Fetch AMC contracts from Supabase
  const fetchContracts = async () => {
    setIsLoadingContracts(true);
    try {
      const { data, error } = await supabase
        .from('amc_contracts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching contracts:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch AMC contracts data."
        });
      } else {
        setContracts(data);
        
        // Add unique customers from contracts if not already added
        const contractCustomers = [...new Set(data.map(item => item.customer_name))];
        setCustomers(prev => {
          const allCustomers = [...prev, ...contractCustomers];
          return [...new Set(allCustomers)];
        });
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred."
      });
    } finally {
      setIsLoadingContracts(false);
    }
  };

  // Filter for consumable usage
  const filteredUsage = consumableUsage.filter(item => {
    const matchesSearch = item.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         item.machine_model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.serial_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.item_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCustomer = selectedCustomer === "all" || item.customer_name === selectedCustomer;
    
    return matchesSearch && matchesCustomer;
  });

  // Filter for contracts
  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = contract.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         contract.machine_model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.serial_number.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCustomer = selectedCustomer === "all" || contract.customer_name === selectedCustomer;
    
    return matchesSearch && matchesCustomer;
  });

  // Handle adding a new consumable usage
  const handleAddConsumableUsage = () => {
    setIsAddUsageDialogOpen(true);
  };

  // Handle customer selection change in the add dialog
  const handleCustomerChange = async (customerName: string) => {
    setNewUsage(prev => ({ ...prev, customer_name: customerName }));
    
    // Find the customer ID
    const selectedContract = contracts.find(c => c.customer_name === customerName);
    if (selectedContract) {
      setNewUsage(prev => ({ 
        ...prev, 
        customer_id: selectedContract.id 
      }));

      // Filter contracts for this customer
      const customerContracts = contracts.filter(c => c.customer_name === customerName);
      setCustomerContracts(customerContracts);
    }
  };

  // Handle contract selection change
  const handleContractChange = (contractId: string) => {
    const selectedContract = contracts.find(c => c.id === contractId);
    if (selectedContract) {
      setNewUsage(prev => ({ 
        ...prev, 
        contract_id: contractId,
        machine_id: selectedContract.id  // Using contract ID as machine ID for now
      }));
    }
  };

  // Handle submit of new consumable usage
  const handleSubmitUsage = async () => {
    if (!newUsage.customer_name || !newUsage.item_name || !newUsage.date) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all required fields."
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Find the selected contract
      const selectedContract = contracts.find(c => c.id === newUsage.contract_id);
      
      if (!selectedContract) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please select a valid contract."
        });
        return;
      }
      
      // Prepare the data for insertion
      const newUsageData = {
        customer_id: newUsage.customer_id,
        customer_name: newUsage.customer_name,
        contract_id: newUsage.contract_id,
        machine_id: newUsage.machine_id,
        machine_model: selectedContract.machine_model,
        machine_type: selectedContract.contract_type === "Full Service" ? "Multifunction" : "Printer",
        serial_number: selectedContract.serial_number,
        date: newUsage.date,
        item_name: newUsage.item_name,
        quantity: newUsage.quantity,
        cost: newUsage.cost,
        engineer_name: newUsage.engineer_name || null,
        remarks: newUsage.remarks || null,
        department: selectedContract.department || null
      };
      
      // Insert the new consumable usage into Supabase
      const { data, error } = await supabase
        .from('amc_consumable_usage')
        .insert(newUsageData)
        .select();
      
      if (error) {
        console.error("Error adding consumable usage:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to add consumable usage."
        });
      } else {
        toast({
          title: "Success",
          description: "Consumable usage added successfully."
        });
        
        // Refresh the consumable usage data
        fetchConsumableUsage();
        
        // Close the dialog and reset the form
        setIsAddUsageDialogOpen(false);
        setNewUsage({
          customer_id: "",
          customer_name: "",
          machine_id: "",
          contract_id: "",
          date: format(new Date(), 'yyyy-MM-dd'),
          item_name: "",
          quantity: 1,
          cost: 0,
          engineer_name: "",
          remarks: ""
        });
        setSelectedDate(new Date());
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle refresh button click
  const handleRefresh = () => {
    fetchConsumableUsage();
    fetchContracts();
    toast({
      title: "Refreshed",
      description: "Data has been refreshed."
    });
  };

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">AMC Consumables Tracker</h1>
          <p className="text-muted-foreground">
            Track and manage consumables used for AMC contracts
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Select Date Range
          </Button>
          <Button onClick={handleAddConsumableUsage}>
            <Plus className="h-4 w-4 mr-2" />
            Record Consumable Usage
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>AMC Consumables Management</CardTitle>
              <CardDescription>
                Monitor and track consumable usage across all AMC contracts
              </CardDescription>
            </div>
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full sm:w-auto">
              <TabsList className="bg-muted">
                <TabsTrigger value="usage">Usage History</TabsTrigger>
                <TabsTrigger value="contracts">AMC Contracts</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex flex-col sm:flex-row gap-3 justify-between">
            <div className="flex flex-1 gap-3">
              <Input
                placeholder="Search by customer, machine, or item..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-xs"
              />
              <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select Customer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Customers</SelectItem>
                  {customers.map((customer) => (
                    <SelectItem key={customer} value={customer}>
                      {customer}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="icon" onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsContent value="usage" className="mt-0">
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Machine</TableHead>
                      <TableHead>Serial No.</TableHead>
                      <TableHead>Item</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Cost (₹)</TableHead>
                      <TableHead>Engineer</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingUsage ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-6">
                          <div className="flex flex-col items-center justify-center text-muted-foreground">
                            <RefreshCw className="h-8 w-8 mb-2 animate-spin" />
                            <p>Loading consumable usage records...</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredUsage.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-6">
                          <div className="flex flex-col items-center justify-center text-muted-foreground">
                            <Printer className="h-8 w-8 mb-2" />
                            <p>No consumable usage records found</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsage.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.date}</TableCell>
                          <TableCell>
                            <div className="font-medium">{item.customer_name}</div>
                            <div className="text-xs text-muted-foreground">{item.department}</div>
                          </TableCell>
                          <TableCell>
                            <div>{item.machine_model}</div>
                            <div className="text-xs text-muted-foreground">{item.machine_type}</div>
                          </TableCell>
                          <TableCell>{item.serial_number}</TableCell>
                          <TableCell>{item.item_name}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>₹{item.cost.toLocaleString()}</TableCell>
                          <TableCell>{item.engineer_name || "N/A"}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="contracts" className="mt-0">
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Machine</TableHead>
                      <TableHead>Serial No.</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Monthly Rent</TableHead>
                      <TableHead>Copy Limit</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingContracts ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-6">
                          <div className="flex flex-col items-center justify-center text-muted-foreground">
                            <RefreshCw className="h-8 w-8 mb-2 animate-spin" />
                            <p>Loading AMC contracts...</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredContracts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-6">
                          <div className="flex flex-col items-center justify-center text-muted-foreground">
                            <FileCheck className="h-8 w-8 mb-2" />
                            <p>No AMC contracts found</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredContracts.map((contract) => (
                        <TableRow key={contract.id}>
                          <TableCell>
                            <div className="font-medium">{contract.customer_name}</div>
                            <div className="text-xs text-muted-foreground">{contract.department}</div>
                          </TableCell>
                          <TableCell>{contract.machine_model}</TableCell>
                          <TableCell>{contract.serial_number}</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {contract.start_date.split('-')[0]}-{contract.end_date.split('-')[0]}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {contract.start_date} - {contract.end_date}
                            </div>
                          </TableCell>
                          <TableCell>₹{contract.monthly_rent.toLocaleString()}</TableCell>
                          <TableCell>
                            <div>{contract.copy_limit_a4.toLocaleString()} A4</div>
                            <div className="text-xs text-muted-foreground">
                              ₹{contract.extra_a4_copy_charge} per extra copy
                            </div>
                          </TableCell>
                          <TableCell>{contract.contract_type}</TableCell>
                          <TableCell>
                            <Badge variant={contract.status === "Active" ? "success" : "secondary"}>
                              {contract.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Dialog for adding new consumable usage */}
      <Dialog open={isAddUsageDialogOpen} onOpenChange={setIsAddUsageDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Record Consumable Usage</DialogTitle>
            <DialogDescription>
              Add details about consumables used for an AMC contract.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="customer" className="text-right">
                Customer
              </Label>
              <div className="col-span-3">
                <Select 
                  value={newUsage.customer_name} 
                  onValueChange={handleCustomerChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map(customer => (
                      <SelectItem key={customer} value={customer}>
                        {customer}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="contract" className="text-right">
                Contract
              </Label>
              <div className="col-span-3">
                <Select 
                  value={newUsage.contract_id} 
                  onValueChange={handleContractChange}
                  disabled={!newUsage.customer_name}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select contract" />
                  </SelectTrigger>
                  <SelectContent>
                    {customerContracts.map(contract => (
                      <SelectItem key={contract.id} value={contract.id}>
                        {contract.machine_model} - {contract.serial_number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Date
              </Label>
              <div className="col-span-3">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => {
                        if (date) {
                          setSelectedDate(date);
                          setNewUsage(prev => ({
                            ...prev,
                            date: format(date, 'yyyy-MM-dd')
                          }));
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="item-name" className="text-right">
                Item Name
              </Label>
              <Input
                id="item-name"
                className="col-span-3"
                value={newUsage.item_name}
                onChange={(e) => setNewUsage(prev => ({ ...prev, item_name: e.target.value }))}
                placeholder="e.g. Toner Cartridge"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quantity" className="text-right">
                Quantity
              </Label>
              <Input
                id="quantity"
                type="number"
                className="col-span-3"
                value={newUsage.quantity}
                onChange={(e) => setNewUsage(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                min="1"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="cost" className="text-right">
                Cost (₹)
              </Label>
              <Input
                id="cost"
                type="number"
                className="col-span-3"
                value={newUsage.cost}
                onChange={(e) => setNewUsage(prev => ({ ...prev, cost: parseInt(e.target.value) || 0 }))}
                min="0"
                placeholder="e.g. 3500"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="engineer" className="text-right">
                Engineer
              </Label>
              <Input
                id="engineer"
                className="col-span-3"
                value={newUsage.engineer_name || ""}
                onChange={(e) => setNewUsage(prev => ({ ...prev, engineer_name: e.target.value }))}
                placeholder="Optional"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="remarks" className="text-right">
                Remarks
              </Label>
              <Textarea
                id="remarks"
                className="col-span-3"
                value={newUsage.remarks || ""}
                onChange={(e) => setNewUsage(prev => ({ ...prev, remarks: e.target.value }))}
                placeholder="Optional notes about this usage"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="submit" 
              onClick={handleSubmitUsage} 
              disabled={isSubmitting || !newUsage.customer_name || !newUsage.contract_id || !newUsage.item_name}
            >
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AmcConsumables;
