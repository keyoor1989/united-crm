
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import ServiceExpenseForm from "@/components/service/ServiceExpenseForm";
import ServiceExpenseList from "@/components/service/ServiceExpenseList";
import { ServiceExpense } from "@/types/serviceExpense";
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
import { Engineer } from "@/types/service";
import { useServiceData } from "@/hooks/useServiceData";

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
  
  // Get active service calls
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

  if (isLoading || loadingExpenses || isLoadingCalls) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Loading expense data...</p>
      </div>
    );
  }
  
  // Filter out completed or cancelled service calls
  const activeServiceCalls = allCalls.filter(
    call => call.status !== "Completed" && call.status !== "Cancelled"
  );
  
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
        
        {selectedEngineer && (
          <ServiceExpenseForm 
            serviceCallId=""  // Default empty value, will be selected in the form
            engineerId={selectedEngineer.id}
            engineerName={selectedEngineer.name}
            onExpenseAdded={handleExpenseAdded}
            activeServiceCalls={activeServiceCalls}
          />
        )}
      </div>
      <div className="md:col-span-2">
        <ServiceExpenseList 
          expenses={expenses} 
          onExpenseStatusChanged={handleExpenseStatusChanged}
        />
      </div>
    </div>
  );
};

export default ServiceExpensesTab;
