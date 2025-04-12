import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ExpenseCategory, ServiceExpense } from "@/types/serviceExpense";
import { ServiceCall } from "@/types/service";
import { v4 as uuidv4 } from "uuid";
import { CalendarIcon, Receipt, User, Wrench, Building, AlertCircle, CheckCircle, Clock, AlertTriangle, Search } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, isAfter, isBefore, isEqual, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useCustomers } from "@/hooks/useCustomers";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";

interface ServiceExpenseFormProps {
  serviceCallId: string;
  engineerId: string;
  engineerName: string;
  onExpenseAdded: (expense: ServiceExpense) => void;
  completedServiceCalls: ServiceCall[];
  expenses?: ServiceExpense[];
}

const ServiceExpenseForm = ({
  serviceCallId,
  engineerId,
  engineerName,
  onExpenseAdded,
  completedServiceCalls,
  expenses = []
}: ServiceExpenseFormProps) => {
  const [category, setCategory] = useState<ExpenseCategory>("Travel");
  const [amount, setAmount] = useState<string>("0");
  const [description, setDescription] = useState<string>("");
  const [date, setDate] = useState<Date>(new Date());
  const [selectedServiceCallId, setSelectedServiceCallId] = useState<string>(serviceCallId);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [selectedCustomerName, setSelectedCustomerName] = useState<string | null>(null);
  const [showAttentionAlert, setShowAttentionAlert] = useState<boolean>(false);
  const [expenseDate, setExpenseDate] = useState<Date>(new Date());
  const [dateError, setDateError] = useState<string | null>(null);
  
  const { toast } = useToast();
  const { customers, isLoading: customersLoading } = useCustomers();
  
  const hasExistingExpenses = selectedServiceCallId && selectedServiceCallId !== "general" && 
    expenses.some(expense => expense.serviceCallId === selectedServiceCallId);
  
  useEffect(() => {
    if (serviceCallId) {
      setSelectedServiceCallId(serviceCallId);
    }
  }, [serviceCallId]);
  
  useEffect(() => {
    if (selectedServiceCallId && selectedServiceCallId !== "general") {
      const selectedCall = completedServiceCalls.find(call => call.id === selectedServiceCallId);
      if (selectedCall) {
        setSelectedCustomerId(selectedCall.customerId);
        setSelectedCustomerName(selectedCall.customerName);
        
        if (selectedCall.completionTime) {
          const completionDate = parseISO(selectedCall.completionTime);
          
          setDateError(null);
          
          if (isBefore(expenseDate, completionDate) && !isEqual(expenseDate, completionDate)) {
            setDateError("Expense date cannot be before service call completion date");
          }
        }
        
        setShowAttentionAlert(false);
      }
    } else {
      setSelectedCustomerId(null);
      setSelectedCustomerName(null);
      setShowAttentionAlert(true);
      setDateError(null);
    }
  }, [selectedServiceCallId, completedServiceCalls, expenseDate]);
  
  const handleCustomerChange = (customerId: string) => {
    setSelectedCustomerId(customerId === "no_customer" ? null : customerId);
    
    if (customerId === "no_customer") {
      setSelectedCustomerName(null);
    } else {
      const customer = customers.find(c => c.id === customerId);
      if (customer) {
        setSelectedCustomerName(customer.name);
      }
    }
  };
  
  const handleExpenseDateChange = (newDate: Date) => {
    setExpenseDate(newDate);
    
    if (selectedServiceCallId && selectedServiceCallId !== "general") {
      const selectedCall = completedServiceCalls.find(call => call.id === selectedServiceCallId);
      if (selectedCall && selectedCall.completionTime) {
        const completionDate = parseISO(selectedCall.completionTime);
        
        setDateError(null);
        
        if (isBefore(newDate, completionDate) && !isEqual(newDate, completionDate)) {
          setDateError("Expense date cannot be before service call completion date");
        }
      }
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!category || !amount || !description) {
      return;
    }
    
    if (dateError) {
      toast({
        title: "Invalid Date",
        description: dateError,
        variant: "destructive",
      });
      return;
    }
    
    const newExpense: ServiceExpense = {
      id: uuidv4(),
      serviceCallId: selectedServiceCallId || "general",
      engineerId,
      engineerName,
      customerId: selectedCustomerId,
      customerName: selectedCustomerName,
      category,
      amount: parseFloat(amount),
      description,
      date: expenseDate.toISOString(),
      isReimbursed: false,
      createdAt: new Date().toISOString(),
    };
    
    onExpenseAdded(newExpense);
    
    setCategory("Travel");
    setAmount("0");
    setDescription("");
    setExpenseDate(new Date());
  };

  const getServiceCallExpenseStatus = (serviceCallId: string) => {
    return expenses.some(expense => expense.serviceCallId === serviceCallId);
  };

  const sortedServiceCalls = [...completedServiceCalls].sort((a, b) => {
    const dateA = a.completionTime ? new Date(a.completionTime).getTime() : 0;
    const dateB = b.completionTime ? new Date(b.completionTime).getTime() : 0;
    return dateB - dateA;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Expense</CardTitle>
        <CardDescription>
          <div className="flex items-center">
            <User className="h-4 w-4 mr-2" />
            Engineer: <span className="ml-2 font-medium">{engineerName}</span>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="service-call" className="flex items-center">
              Completed Service Call <span className="text-red-500 ml-1">*</span>
            </Label>
            <Select
              value={selectedServiceCallId || ""}
              onValueChange={setSelectedServiceCallId}
            >
              <SelectTrigger id="service-call">
                <SelectValue placeholder="Select completed service call" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">
                  <div className="flex items-center">
                    <Wrench className="h-4 w-4 mr-2" />
                    General Expense (Not tied to specific call)
                  </div>
                </SelectItem>
                
                {sortedServiceCalls.length > 0 ? (
                  sortedServiceCalls.map((call) => {
                    const hasExpenses = getServiceCallExpenseStatus(call.id);
                    const completionDate = call.completionTime 
                      ? format(new Date(call.completionTime), "dd/MM/yyyy") 
                      : "Unknown";
                    
                    return (
                      <SelectItem key={call.id} value={call.id}>
                        <div className="flex flex-col">
                          <span className="flex items-center">
                            {call.customerName} - {call.machineModel}
                            {hasExpenses ? (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="ml-1">
                                      <AlertTriangle className="h-3 w-3 text-amber-600" />
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Expense already submitted for this call</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            ) : (
                              <CheckCircle className="h-3 w-3 ml-1 text-green-600" />
                            )}
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            Completed: {completionDate} - {call.location}
                          </span>
                        </div>
                      </SelectItem>
                    );
                  })
                ) : (
                  <SelectItem value="no-completed-calls" disabled>
                    <span className="text-muted-foreground">No completed service calls available</span>
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          
          {hasExistingExpenses && (
            <Alert variant="warning" className="bg-amber-50 border-amber-200">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Expense Already Submitted</AlertTitle>
              <AlertDescription>
                An expense has already been submitted for this service call. Adding another expense 
                for the same call may lead to duplicate reimbursements.
              </AlertDescription>
            </Alert>
          )}
          
          {showAttentionAlert && (
            <Alert variant="warning" className="bg-amber-50 border-amber-200">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Attention</AlertTitle>
              <AlertDescription>
                This expense won't be tied to a specific service call, so it won't be calculated 
                in any service call's profit. Select a specific service call if this expense should 
                reduce a service call's profit.
              </AlertDescription>
            </Alert>
          )}
          
          {selectedServiceCallId === "general" && (
            <div className="space-y-2">
              <Label htmlFor="customer">Customer (Optional)</Label>
              <Select
                value={selectedCustomerId || "no_customer"}
                onValueChange={handleCustomerChange}
              >
                <SelectTrigger id="customer">
                  <SelectValue placeholder="Select customer (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no_customer">
                    <div className="flex items-center">
                      <Building className="h-4 w-4 mr-2" />
                      No specific customer
                    </div>
                  </SelectItem>
                  
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
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Expense Category <span className="text-red-500">*</span></Label>
              <Select
                value={category}
                onValueChange={(value) => setCategory(value as ExpenseCategory)}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Travel">Travel</SelectItem>
                  <SelectItem value="Food">Food</SelectItem>
                  <SelectItem value="Accommodation">Accommodation</SelectItem>
                  <SelectItem value="Fuel">Fuel</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₹) <span className="text-red-500">*</span></Label>
              <Input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="date" className={cn(dateError && "text-red-500")}>
              Expense Date <span className="text-red-500">*</span>
              {dateError && <span className="ml-2 text-xs text-red-500">({dateError})</span>}
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !expenseDate && "text-muted-foreground",
                    dateError && "border-red-500 text-red-500"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {expenseDate ? format(expenseDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={expenseDate}
                  onSelect={(date) => date && handleExpenseDateChange(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description <span className="text-red-500">*</span></Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter expense details"
              required
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full"
            disabled={!!dateError}
          >
            <Receipt className="mr-2 h-4 w-4" />
            Add Expense
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ServiceExpenseForm;
