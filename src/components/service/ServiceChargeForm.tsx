
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CalendarIcon, Receipt, DollarSign, TrendingUp } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useCustomers } from "@/hooks/useCustomers";
import { addServiceCharge } from "@/services/serviceExpenseService";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ServiceChargeFormProps {
  onChargeAdded?: () => void;
}

const ServiceChargeForm = ({ onChargeAdded }: ServiceChargeFormProps) => {
  const { toast } = useToast();
  const [amount, setAmount] = useState<string>("0");
  const [description, setDescription] = useState<string>("");
  const [date, setDate] = useState<Date>(new Date());
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [selectedCustomerName, setSelectedCustomerName] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { customers, isLoading: customersLoading } = useCustomers();
  
  const handleCustomerChange = (customerId: string) => {
    if (customerId === "select_customer") {
      setSelectedCustomerId(null);
      setSelectedCustomerName(null);
      return;
    }
    
    setSelectedCustomerId(customerId);
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      setSelectedCustomerName(customer.name);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCustomerId || !selectedCustomerName || !amount || !description) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    const success = await addServiceCharge(
      selectedCustomerId,
      selectedCustomerName,
      parseFloat(amount),
      description,
      date.toISOString()
    );
    
    setIsSubmitting(false);
    
    if (success) {
      // Reset form
      setAmount("0");
      setDescription("");
      setDate(new Date());
      setSelectedCustomerId(null);
      setSelectedCustomerName(null);
      
      // Call callback
      if (onChargeAdded) {
        onChargeAdded();
      }
    }
  };
  
  if (customersLoading) {
    return <div>Loading customers...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-500" />
          Add Service Income
        </CardTitle>
        <CardDescription>
          Record a service charge payment received from a customer (Income)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customer">Customer</Label>
            <Select
              value={selectedCustomerId || "select_customer"}
              onValueChange={handleCustomerChange}
            >
              <SelectTrigger id="customer">
                <SelectValue placeholder="Select customer" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    <div className="flex flex-col">
                      <span>{customer.name}</span>
                      <span className="text-xs text-muted-foreground">{customer.location}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="amount">Amount Received (₹)</Label>
            <Input
              id="amount"
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="bg-green-50"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="date">Date Received</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(date) => date && setDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter service income details"
              required
            />
          </div>
          
          <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isSubmitting}>
            <DollarSign className="mr-2 h-4 w-4" />
            {isSubmitting ? "Adding..." : "Record Service Income"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ServiceChargeForm;
