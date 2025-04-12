
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import ServiceExpenseForm from "@/components/service/ServiceExpenseForm";
import ServiceExpenseList from "@/components/service/ServiceExpenseList";
import { ServiceExpense } from "@/types/serviceExpense";
import { ServiceCall } from "@/types/service";
import { fetchServiceExpenses, addServiceExpense } from "@/services/serviceExpenseService";
import { useToast } from "@/hooks/use-toast";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Engineer } from "@/types/service";
import { useServiceData } from "@/hooks/useServiceData";
import { AlertCircle, Search } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ServiceExpensesTabProps {
  engineers: Engineer[];
  onExpenseAdded?: (expense: ServiceExpense) => void;
  isLoading: boolean;
}

const ServiceExpensesTab = ({ 
  engineers, 
  onExpenseAdded,
  isLoading 
}: ServiceExpensesTabProps) => {
  const { toast } = useToast();
  const [expenses, setExpenses] = useState<ServiceExpense[]>([]);
  const [loadingExpenses, setLoadingExpenses] = useState(true);
  const [selectedEngineer, setSelectedEngineer] = useState<Engineer | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [expenseSubmittedFilter, setExpenseSubmittedFilter] = useState<string>("all");
  
  // Get completed service calls
  const { allCalls, isLoading: isLoadingCalls } = useServiceData();
  
  useEffect(() => {
    if (!isLoading && engineers.length > 0) {
      setSelectedEngineer(engineers[0]);
    }
  }, [engineers, isLoading]);
  
  useEffect(() => {
    loadExpenses();
  }, []);
  
  const loadExpenses = async () => {
    setLoadingExpenses(true);
    try {
      const fetchedExpenses = await fetchServiceExpenses();
      console.log("Loaded expenses in ServiceExpensesTab:", fetchedExpenses);
      setExpenses(fetchedExpenses);
    } catch (error) {
      console.error("Error loading expenses:", error);
      toast({
        title: "Error",
        description: "Failed to load expenses. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingExpenses(false);
    }
  };
  
  const handleExpenseAdded = async (expense: ServiceExpense) => {
    // Add to database
    console.log("Adding expense:", expense);
    const success = await addServiceExpense(expense);
    
    if (success) {
      // Refresh the expenses list
      await loadExpenses();
      
      // Notify parent component if needed
      if (onExpenseAdded) {
        onExpenseAdded(expense);
      }
      
      // Show toast notification
      toast({
        title: "Expense Added",
        description: `${expense.category} expense of ₹${expense.amount} added for ${expense.engineerName}`,
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to add expense. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEngineerChange = (engineerId: string) => {
    const engineer = engineers.find(eng => eng.id === engineerId);
    if (engineer) {
      setSelectedEngineer(engineer);
    }
  };
  
  const handleExpenseStatusChanged = () => {
    // Refresh the expenses list when status changes
    loadExpenses();
  };

  // Filter completed service calls based on search and expense status
  const filterCompletedServiceCalls = (): ServiceCall[] => {
    // Start with all completed service calls
    let filteredCalls = allCalls.filter(call => call.status === "Completed");

    // Apply search filter if search term exists
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filteredCalls = filteredCalls.filter(call => 
        call.customerName.toLowerCase().includes(searchLower) ||
        call.machineModel.toLowerCase().includes(searchLower) ||
        call.location.toLowerCase().includes(searchLower) ||
        call.serialNumber?.toLowerCase().includes(searchLower)
      );
    }

    // Apply expense submitted filter
    if (expenseSubmittedFilter !== "all") {
      // Create a set of service call IDs that have expenses
      const serviceCallsWithExpenses = new Set(
        expenses
          .filter(exp => exp.serviceCallId && exp.serviceCallId !== "general")
          .map(exp => exp.serviceCallId)
      );

      if (expenseSubmittedFilter === "with-expenses") {
        filteredCalls = filteredCalls.filter(call => serviceCallsWithExpenses.has(call.id));
      } else if (expenseSubmittedFilter === "without-expenses") {
        filteredCalls = filteredCalls.filter(call => !serviceCallsWithExpenses.has(call.id));
      }
    }

    return filteredCalls;
  };

  if (isLoading || loadingExpenses || isLoadingCalls) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Loading expense data...</p>
      </div>
    );
  }
  
  // Get filtered completed service calls
  const completedServiceCalls = filterCompletedServiceCalls();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-1">
        <Card className="mb-4">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <Label htmlFor="engineer-select">Select Engineer</Label>
              <Select
                value={selectedEngineer?.id}
                onValueChange={handleEngineerChange}
              >
                <SelectTrigger id="engineer-select">
                  <SelectValue placeholder="Select engineer" />
                </SelectTrigger>
                <SelectContent>
                  {engineers.map((engineer) => (
                    <SelectItem key={engineer.id} value={engineer.id}>
                      {engineer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
        
        <Card className="mb-4">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="service-call-search">Search Completed Service Calls</Label>
                <div className="flex items-center mt-1.5">
                  <Search className="h-4 w-4 absolute ml-2.5 text-muted-foreground" />
                  <Input
                    id="service-call-search"
                    placeholder="Search by customer, machine, location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="expense-status-filter">Filter by Expense Status</Label>
                <Select
                  value={expenseSubmittedFilter}
                  onValueChange={setExpenseSubmittedFilter}
                >
                  <SelectTrigger id="expense-status-filter">
                    <SelectValue placeholder="Filter by expense status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Completed Calls</SelectItem>
                    <SelectItem value="without-expenses">Without Expenses Submitted</SelectItem>
                    <SelectItem value="with-expenses">With Expenses Submitted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {selectedEngineer && (
          <ServiceExpenseForm 
            serviceCallId=""  // Default empty value, will be selected in the form
            engineerId={selectedEngineer.id}
            engineerName={selectedEngineer.name}
            onExpenseAdded={handleExpenseAdded}
            completedServiceCalls={completedServiceCalls}
            expenses={expenses}
          />
        )}
      </div>
      <div className="md:col-span-2">
        {completedServiceCalls.length === 0 && !searchTerm && expenseSubmittedFilter === "all" && (
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No completed service calls found</AlertTitle>
            <AlertDescription>
              Expenses can only be added for completed service calls. Please complete some service calls before adding expenses.
            </AlertDescription>
          </Alert>
        )}
        
        {searchTerm && completedServiceCalls.length === 0 && (
          <Alert className="mb-4" variant="warning">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No matching service calls found</AlertTitle>
            <AlertDescription>
              Try adjusting your search term or filters to find completed service calls.
            </AlertDescription>
          </Alert>
        )}
        
        <ServiceExpenseList 
          expenses={expenses} 
          onExpenseStatusChanged={handleExpenseStatusChanged}
          serviceCalls={allCalls}
        />
      </div>
    </div>
  );
};

export default ServiceExpensesTab;
