
import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { CalendarClock, Search, X, Phone, MapPin, Printer } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { SalesFollowUpFormData } from "./types";
import { supabase } from "@/integrations/supabase/client";
import { CustomerType } from "@/types/customer";
import { toast } from "sonner";

interface SalesFollowUpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newSalesFollowUp: SalesFollowUpFormData;
  setNewSalesFollowUp: React.Dispatch<React.SetStateAction<SalesFollowUpFormData>>;
  onAddSalesFollowUp: () => void;
}

export const SalesFollowUpDialog: React.FC<SalesFollowUpDialogProps> = ({
  open,
  onOpenChange,
  newSalesFollowUp,
  setNewSalesFollowUp,
  onAddSalesFollowUp,
}) => {
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<CustomerType[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const toggleCustomerSearch = () => {
    setShowCustomerSearch(!showCustomerSearch);
    if (!showCustomerSearch) {
      setSearchTerm("");
      setSearchResults([]);
    }
  };

  const selectCustomer = (customer: CustomerType) => {
    setNewSalesFollowUp({
      ...newSalesFollowUp,
      customerName: customer.name,
      customerId: customer.id
    });
    setShowCustomerSearch(false);
    
    // Show notification when customer is selected
    toast.success(`Customer "${customer.name}" selected`, {
      description: "Customer information has been added to the follow-up"
    });
  };

  const searchCustomers = async (term: string) => {
    if (term.length < 1) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    try {
      console.log("Searching for term:", term);
      
      // Search in Supabase database - can search by name, phone, location (area), or machine
      const { data: nameData, error: nameError } = await supabase
        .from('customers')
        .select('id, name, phone, email, area, lead_status, customer_machines(machine_name)')
        .ilike('name', `%${term}%`)
        .order('name')
        .limit(10);
      
      // Search by phone - using exact match and partial match
      const { data: phoneData, error: phoneError } = await supabase
        .from('customers')
        .select('id, name, phone, email, area, lead_status, customer_machines(machine_name)')
        .or(`phone.ilike.%${term}%,phone.eq.${term}`)
        .order('name')
        .limit(10);
      
      // Search by location/area
      const { data: areaData, error: areaError } = await supabase
        .from('customers')
        .select('id, name, phone, email, area, lead_status, customer_machines(machine_name)')
        .ilike('area', `%${term}%`)
        .order('name')
        .limit(10);
      
      // Search by machine model via the related table
      const { data: machineData, error: machineError } = await supabase
        .from('customers')
        .select('id, name, phone, email, area, lead_status, customer_machines!inner(machine_name)')
        .filter('customer_machines.machine_name', 'ilike', `%${term}%`)
        .order('name')
        .limit(10);
        
      if (nameError || phoneError || areaError || machineError) {
        console.error("Error searching customers:", nameError || phoneError || areaError || machineError);
        toast.error("Failed to search customers");
        return;
      }
      
      // Combine results and remove duplicates
      const combinedResults = [...(nameData || []), ...(phoneData || []), ...(areaData || []), ...(machineData || [])];
      
      console.log("Search results:", {
        nameData,
        phoneData,
        areaData,
        machineData,
        combinedResults
      });
      
      const uniqueCustomers = combinedResults.filter((customer, index, self) => 
        index === self.findIndex(c => c.id === customer.id)
      );
      
      // Convert to CustomerType format
      const customers: CustomerType[] = uniqueCustomers.map(customer => ({
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email || "",
        location: customer.area,
        lastContact: "N/A",
        machines: customer.customer_machines ? customer.customer_machines.map((m: any) => m.machine_name).filter(Boolean) : [],
        status: "Active"
      }));
      
      setSearchResults(customers);
    } catch (error) {
      console.error("Error in search process:", error);
      toast.error("An error occurred while searching");
    } finally {
      setIsSearching(false);
    }
  };

  const clearCustomerSelection = () => {
    setNewSalesFollowUp({
      ...newSalesFollowUp,
      customerName: "",
      customerId: undefined
    });
    toast.info("Customer selection cleared");
  };

  const handleSaveFollowUp = () => {
    // Validate required fields
    if (!newSalesFollowUp.customerName) {
      toast.error("Please select a customer");
      return;
    }
    
    if (!newSalesFollowUp.date) {
      toast.error("Please select a follow-up date");
      return;
    }
    
    if (!newSalesFollowUp.type) {
      toast.error("Please select a follow-up type");
      return;
    }
    
    // Call the parent's onAddSalesFollowUp function
    onAddSalesFollowUp();
    
    // Show success notification with action date
    const formattedDate = newSalesFollowUp.date ? format(newSalesFollowUp.date, "dd MMM yyyy") : "Unknown date";
    toast.success(`Follow-up scheduled for ${formattedDate}`, {
      description: `A ${newSalesFollowUp.type} follow-up has been scheduled for ${newSalesFollowUp.customerName}`,
      action: {
        label: "View Calendar",
        onClick: () => {
          // You could navigate to a calendar view here if available
          console.log("Navigate to calendar view");
        }
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Schedule Sales Follow-up</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="customer-name">Customer Name</Label>
            <div className="flex items-center gap-2">
              <Input
                id="customer-name"
                placeholder="Enter customer name"
                value={newSalesFollowUp.customerName || ''}
                readOnly
                className="flex-1"
              />
              {newSalesFollowUp.customerName ? (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={clearCustomerSelection}
                  title="Clear selection"
                >
                  <X className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleCustomerSearch}
                  title={showCustomerSearch ? "Close search" : "Search customers"}
                >
                  <Search className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            {showCustomerSearch && (
              <div className="p-3 border rounded-md bg-background mt-2">
                <div className="flex items-center gap-2 mb-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search by name, phone, city, machine..." 
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      searchCustomers(e.target.value);
                    }}
                    className="flex-1"
                    autoFocus
                  />
                </div>
                
                <div className="flex gap-3 text-xs text-muted-foreground mb-2">
                  <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> Phone</span>
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> City</span>
                  <span className="flex items-center gap-1"><Printer className="h-3 w-3" /> Machine</span>
                </div>
                
                {isSearching ? (
                  <div className="py-2 text-center text-sm text-muted-foreground">
                    Searching...
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="max-h-60 overflow-y-auto">
                    {searchResults.map((customer) => (
                      <div 
                        key={customer.id}
                        className="p-2 hover:bg-muted rounded-md cursor-pointer flex items-center gap-2"
                        onClick={() => selectCustomer(customer)}
                      >
                        <div className="flex-1">
                          <div className="font-medium">{customer.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {customer.phone}
                            {customer.location && ` • ${customer.location}`}
                          </div>
                        </div>
                        {customer.machines.length > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {customer.machines.length} {customer.machines.length === 1 ? 'machine' : 'machines'}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                ) : searchTerm.length > 0 ? (
                  <div className="py-2 text-center text-sm text-muted-foreground">
                    No customers found
                  </div>
                ) : (
                  <div className="py-2 text-center text-sm text-muted-foreground">
                    Type to search customers
                  </div>
                )}
              </div>
            )}
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
          <Button onClick={() => onOpenChange(false)} variant="outline">Cancel</Button>
          <Button onClick={handleSaveFollowUp}>Save Follow-up</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

