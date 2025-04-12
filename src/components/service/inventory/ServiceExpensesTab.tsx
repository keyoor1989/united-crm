
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import ServiceExpenseForm from "@/components/service/ServiceExpenseForm";
import ServiceExpenseList from "@/components/service/ServiceExpenseList";
import { ServiceExpense } from "@/types/serviceExpense";
import { Engineer } from "@/types/service";

interface ServiceExpensesTabProps {
  expenses: ServiceExpense[];
  engineers: Engineer[];
  onExpenseAdded: (expense: ServiceExpense) => void;
  isLoading: boolean;
}

const ServiceExpensesTab = ({ 
  expenses, 
  engineers, 
  onExpenseAdded,
  isLoading 
}: ServiceExpensesTabProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Loading expense data...</p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-1">
        <ServiceExpenseForm 
          serviceCallId="dummy-service-call"
          engineerId={engineers[0]?.id || ""}
          engineerName={engineers[0]?.name || ""}
          onExpenseAdded={onExpenseAdded}
        />
      </div>
      <div className="md:col-span-2">
        <ServiceExpenseList expenses={expenses} />
      </div>
    </div>
  );
};

export default ServiceExpensesTab;
