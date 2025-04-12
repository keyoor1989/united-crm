
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import ServiceExpenseForm from "@/components/service/ServiceExpenseForm";
import ServiceExpenseList from "@/components/service/ServiceExpenseList";
import { ServiceExpense } from "@/types/serviceExpense";
import { Engineer } from "@/types/service";
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
    const fetchedExpenses = await fetchServiceExpenses();
    setExpenses(fetchedExpenses);
    setLoadingExpenses(false);
  };
  
  const handleExpenseAdded = async (expense: ServiceExpense) => {
    // Add to database
    const success = await addServiceExpense(expense);
    
    if (success) {
      // Update local state
      setExpenses(prev => [expense, ...prev]);
      
      // Notify parent component if needed
      if (onExpenseAdded) {
        onExpenseAdded(expense);
      }
      
      // Show toast notification
      toast({
        title: "Expense Added",
        description: `${expense.category} expense of ₹${expense.amount} added for ${expense.engineerName}`,
      });
    }
  };

  const handleEngineerChange = (engineerId: string) => {
    const engineer = engineers.find(eng => eng.id === engineerId);
    if (engineer) {
      setSelectedEngineer(engineer);
    }
  };

  if (isLoading || loadingExpenses) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Loading expense data...</p>
      </div>
    );
  }
  
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
            serviceCallId="general" // Fixed value for general expenses
            engineerId={selectedEngineer.id}
            engineerName={selectedEngineer.name}
            onExpenseAdded={handleExpenseAdded}
          />
        )}
      </div>
      <div className="md:col-span-2">
        <ServiceExpenseList 
          expenses={expenses} 
        />
      </div>
    </div>
  );
};

export default ServiceExpensesTab;
