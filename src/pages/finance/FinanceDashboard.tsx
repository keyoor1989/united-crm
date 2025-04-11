
import React, { useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  departmentSummary, 
  financeSummary, 
  financeMonthlyTrend,
  receivableEntries
} from "@/data/finance";
import { formatCurrency } from "@/utils/finance/financeUtils";
import SummaryCards from "@/components/finance/dashboard/SummaryCards";
import MonthlyTrendChart from "@/components/finance/dashboard/MonthlyTrendChart";
import DepartmentCharts from "@/components/finance/dashboard/DepartmentCharts";
import DepartmentSummaryTable from "@/components/finance/dashboard/DepartmentSummaryTable";
import ReceivablesTable from "@/components/finance/dashboard/ReceivablesTable";

const FinanceDashboard = () => {
  // Filter for high priority receivables
  const highPriorityReceivables = useMemo(() => 
    receivableEntries.filter(item => item.priority === 'High'),
    []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Finance Dashboard</h1>
      </div>

      {/* Summary Cards */}
      <SummaryCards 
        financeSummary={financeSummary}
        receivablesCount={receivableEntries.length}
        formatCurrency={formatCurrency}
      />

      {/* Tabs for different views */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="departments">Department Performance</TabsTrigger>
          <TabsTrigger value="receivables">Receivables</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <MonthlyTrendChart 
            data={financeMonthlyTrend} 
            formatCurrency={formatCurrency} 
          />
        </TabsContent>
        
        {/* Departments Tab */}
        <TabsContent value="departments" className="space-y-4">
          <DepartmentCharts 
            departmentData={departmentSummary} 
            formatCurrency={formatCurrency} 
          />
          
          <DepartmentSummaryTable 
            departmentData={departmentSummary} 
            formatCurrency={formatCurrency} 
          />
        </TabsContent>
        
        {/* Receivables Tab */}
        <TabsContent value="receivables" className="space-y-4">
          <ReceivablesTable 
            receivables={highPriorityReceivables}
            formatCurrency={formatCurrency}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinanceDashboard;
