import React, { useState, useEffect } from "react";
import { Search, Plus, Filter, FileText, Printer, BarChart2, CalendarClock, Edit, Trash, File, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { 
  AMCContract, 
  AMCMachine, 
  AMCConsumableUsage, 
  AMCBilling, 
  AMCProfitReport,
  ProfitableMachine 
} from "@/types/inventory";
import AddContractDialog from "@/components/inventory/amc/AddContractDialog";
import AddConsumableUsageDialog from "@/components/inventory/amc/AddConsumableUsageDialog";
import AddMeterReadingDialog from "@/components/inventory/amc/AddMeterReadingDialog";

const AmcTracker = () => {
  const [activeTab, setActiveTab] = useState<string>("contracts");
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  // State for our data
  const [contracts, setContracts] = useState<AMCContract[]>([]);
  const [machines, setMachines] = useState<AMCMachine[]>([]);
  const [consumableUsage, setConsumableUsage] = useState<AMCConsumableUsage[]>([]);
  const [billingData, setBillingData] = useState<AMCBilling[]>([]);
  const [profitReports, setProfitReports] = useState<AMCProfitReport[]>([]);
  const [profitableMachines, setProfitableMachines] = useState<ProfitableMachine[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  
  // Summary metrics
  const [summaryMetrics, setSummaryMetrics] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    profitMargin: 0
  });
  
  useEffect(() => {
    fetchData();
  }, []);
  
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch contracts
      const { data: contractsData, error: contractsError } = await supabase
        .from('amc_contracts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (contractsError) throw contractsError;
      setContracts(contractsData as AMCContract[] || []);
      
      // Fetch machines
      const { data: machinesData, error: machinesError } = await supabase
        .from('amc_machines')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (machinesError) throw machinesError;
      setMachines(machinesData as AMCMachine[] || []);
      
      // Fetch consumable usage
      const { data: usageData, error: usageError } = await supabase
        .from('amc_consumable_usage')
        .select('*')
        .order('date', { ascending: false });
      
      if (usageError) throw usageError;
      setConsumableUsage(usageData as AMCConsumableUsage[] || []);
      
      // Fetch billing data
      const { data: billingData, error: billingError } = await supabase
        .from('amc_billing')
        .select('*')
        .order('billing_month', { ascending: false });
      
      if (billingError) throw billingError;
      setBillingData(billingData as AMCBilling[] || []);
      
      // Fetch profit reports
      const { data: profitData, error: profitError } = await supabase
        .from('amc_profit_reports')
        .select('*')
        .order('month', { ascending: false });
      
      if (profitError) throw profitError;
      setProfitReports(profitData as AMCProfitReport[] || []);
      
      // Calculate and update summary metrics
      calculateSummaryMetrics(billingData as AMCBilling[] || [], usageData as AMCConsumableUsage[] || []);
      updateProfitableMachines(profitData as AMCProfitReport[] || []);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load AMC data');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Calculate summary metrics
  const calculateSummaryMetrics = (billingData: AMCBilling[], usageData: AMCConsumableUsage[]) => {
    // Filter to current month only
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const currentMonthBilling = billingData.filter(bill => {
      const billDate = new Date(bill.billing_month);
      return billDate.getMonth() === currentMonth && billDate.getFullYear() === currentYear;
    });
    
    const currentMonthUsage = usageData.filter(usage => {
      const usageDate = new Date(usage.date);
      return usageDate.getMonth() === currentMonth && usageDate.getFullYear() === currentYear;
    });
    
    // Calculate totals
    const totalRent = currentMonthBilling.reduce((sum, bill) => sum + bill.rent, 0);
    const totalExtraCopyIncome = currentMonthBilling.reduce((sum, bill) => 
      sum + bill.a4_extra_copy_charge + (bill.a3_extra_copy_charge || 0), 0);
    
    const totalRevenue = totalRent + totalExtraCopyIncome;
    
    const totalConsumablesCost = currentMonthUsage.reduce((sum, usage) => sum + usage.cost, 0);
    const totalExpenses = totalConsumablesCost;
    
    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
    
    setSummaryMetrics({
      totalRevenue,
      totalExpenses,
      netProfit,
      profitMargin
    });
  };
  
  // Update profitable machines list
  const updateProfitableMachines = (profitReports: AMCProfitReport[]) => {
    // Group profit reports by machine and calculate total profit
    const machineProfits: Record<string, ProfitableMachine> = {};
    
    profitReports.forEach(report => {
      if (!machineProfits[report.machine_id]) {
        machineProfits[report.machine_id] = {
          id: report.machine_id,
          customerName: report.customer_name,
          machineModel: report.machine_model,
          serialNumber: report.serial_number,
          profit: 0,
          profitMargin: 0
        };
      }
      
      machineProfits[report.machine_id].profit += report.profit;
      // Average profit margin across all reports for this machine
      machineProfits[report.machine_id].profitMargin = 
        (machineProfits[report.machine_id].profitMargin + report.profit_margin) / 2;
    });
    
    // Sort machines by profit and take top 5
    const sortedMachines = Object.values(machineProfits)
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 5);
    
    setProfitableMachines(sortedMachines);
  };
  
  // Function to add a new contract
  const handleAddContract = async (newContract: AMCContract) => {
    try {
      // Insert into contracts table
      const { data: contractData, error: contractError } = await supabase
        .from('amc_contracts')
        .insert([{
          id: newContract.id,
          customer_id: newContract.customer_id,
          customer_name: newContract.customer_name,
          machine_model: newContract.machine_model,
          machine_type: newContract.machine_type,
          serial_number: newContract.serial_number,
          contract_type: newContract.contract_type,
          start_date: newContract.start_date,
          end_date: newContract.end_date,
          monthly_rent: newContract.monthly_rent,
          gst_percent: newContract.gst_percent,
          copy_limit_a4: newContract.copy_limit_a4,
          copy_limit_a3: newContract.copy_limit_a3,
          extra_a4_copy_charge: newContract.extra_a4_copy_charge,
          extra_a3_copy_charge: newContract.extra_a3_copy_charge,
          billing_cycle: newContract.billing_cycle,
          status: newContract.status,
          location: newContract.location,
          department: newContract.department,
          notes: newContract.notes
        }])
        .select();
      
      if (contractError) throw contractError;
      
      // Also add to machines table
      const { data: machineData, error: machineError } = await supabase
        .from('amc_machines')
        .insert([{
          contract_id: newContract.id,
          customer_id: newContract.customer_id,
          customer_name: newContract.customer_name,
          model: newContract.machine_model,
          machine_type: newContract.machine_type,
          serial_number: newContract.serial_number,
          location: newContract.location || 'Main Office',
          department: newContract.department,
          contract_type: newContract.contract_type,
          start_date: newContract.start_date,
          end_date: newContract.end_date,
          current_rent: newContract.monthly_rent,
          copy_limit_a4: newContract.copy_limit_a4,
          copy_limit_a3: newContract.copy_limit_a3,
          last_a4_reading: 0,
          last_a3_reading: 0,
          last_reading_date: new Date().toISOString()
        }])
        .select();
      
      if (machineError) throw machineError;
      
      // Update the state
      setContracts(prevContracts => [...prevContracts, newContract]);
      
      if (machineData && machineData.length > 0) {
        setMachines(prevMachines => [...prevMachines, machineData[0] as AMCMachine]);
      }
      
      toast.success("Contract added successfully");
    } catch (error) {
      console.error('Error adding contract:', error);
      toast.error('Failed to add contract');
    }
  };
  
  // Function to add consumable usage
  const handleAddConsumableUsage = async (newUsage: AMCConsumableUsage) => {
    try {
      // Insert into consumable usage table
      const { data, error } = await supabase
        .from('amc_consumable_usage')
        .insert([{
          contract_id: newUsage.contract_id,
          machine_id: newUsage.machine_id,
          customer_id: newUsage.customer_id,
          customer_name: newUsage.customer_name,
          machine_model: newUsage.machine_model,
          machine_type: newUsage.machine_type,
          serial_number: newUsage.serial_number,
          engineer_id: newUsage.engineer_id,
          engineer_name: newUsage.engineer_name,
          date: newUsage.date,
          item_id: newUsage.item_id,
          item_name: newUsage.item_name,
          quantity: newUsage.quantity,
          cost: newUsage.cost,
          inventory_deducted: newUsage.inventory_deducted,
          remarks: newUsage.remarks
        }])
        .select();
      
      if (error) throw error;
      
      // Update state
      setConsumableUsage(prevUsage => [...prevUsage, newUsage]);
      
      // Update or create profit report
      await updateProfitReportForConsumableUsage(newUsage);
      
      toast.success("Consumable usage added successfully");
    } catch (error) {
      console.error('Error adding consumable usage:', error);
      toast.error('Failed to add consumable usage');
    }
  };
  
  // Update profit report when adding consumable usage
  const updateProfitReportForConsumableUsage = async (usage: AMCConsumableUsage) => {
    try {
      const usageMonth = new Date(usage.date).toISOString().split('T')[0].substring(0, 7) + '-01'; // YYYY-MM-01 format
      
      // Check if report exists for this machine and month
      const { data: existingReports, error: reportQueryError } = await supabase
        .from('amc_profit_reports')
        .select('*')
        .eq('machine_id', usage.machine_id)
        .eq('month', usageMonth);
      
      if (reportQueryError) throw reportQueryError;
      
      const contract = contracts.find(c => c.id === usage.contract_id);
      if (!contract) {
        console.error('Contract not found for usage:', usage);
        return;
      }
      
      if (existingReports && existingReports.length > 0) {
        // Update existing report
        const report = existingReports[0];
        const newConsumablesCost = report.consumables_cost + usage.cost;
        const newTotalExpense = newConsumablesCost + report.engineer_visit_cost + 
                               report.travel_expense + report.food_expense + report.other_expense;
        const newProfit = report.total_income - newTotalExpense;
        const newProfitMargin = (newProfit / report.total_income) * 100;
        
        const { data, error } = await supabase
          .from('amc_profit_reports')
          .update({
            consumables_cost: newConsumablesCost,
            total_expense: newTotalExpense,
            profit: newProfit,
            profit_margin: newProfitMargin
          })
          .eq('id', report.id)
          .select();
        
        if (error) throw error;
        
        // Update state
        setProfitReports(prev => prev.map(r => 
          r.id === report.id ? { ...r, 
            consumables_cost: newConsumablesCost,
            total_expense: newTotalExpense,
            profit: newProfit,
            profit_margin: newProfitMargin
          } : r
        ));
      } else {
        // Create new report
        const newReport: AMCProfitReport = {
          id: usage.id, // Use the same ID as the usage for simplicity
          contract_id: usage.contract_id,
          machine_id: usage.machine_id,
          customer_id: usage.customer_id,
          customer_name: usage.customer_name,
          machine_model: usage.machine_model,
          machine_type: usage.machine_type,
          serial_number: usage.serial_number,
          department: usage.department,
          month: usageMonth,
          rent_received: contract.monthly_rent,
          extra_copy_income: 0, // Will be updated when billing is done
          total_income: contract.monthly_rent,
          consumables_cost: usage.cost,
          engineer_visit_cost: 0,
          travel_expense: 0,
          food_expense: 0,
          other_expense: 0,
          total_expense: usage.cost,
          profit: contract.monthly_rent - usage.cost,
          profit_margin: ((contract.monthly_rent - usage.cost) / contract.monthly_rent) * 100,
          created_at: new Date().toISOString()
        };
        
        const { data, error } = await supabase
          .from('amc_profit_reports')
          .insert([{
            contract_id: newReport.contract_id,
            machine_id: newReport.machine_id,
            customer_id: newReport.customer_id,
            customer_name: newReport.customer_name,
            machine_model: newReport.machine_model,
            machine_type: newReport.machine_type,
            serial_number: newReport.serial_number,
            department: newReport.department,
            month: newReport.month,
            rent_received: newReport.rent_received,
            extra_copy_income: newReport.extra_copy_income,
            total_income: newReport.total_income,
            consumables_cost: newReport.consumables_cost,
            engineer_visit_cost: newReport.engineer_visit_cost,
            travel_expense: newReport.travel_expense,
            food_expense: newReport.food_expense,
            other_expense: newReport.other_expense,
            total_expense: newReport.total_expense,
            profit: newReport.profit,
            profit_margin: newReport.profit_margin
          }])
          .select();
        
        if (error) throw error;
        
        // Update state
        if (data && data.length > 0) {
          setProfitReports(prev => [...prev, data[0] as AMCProfitReport]);
        }
      }
      
      // Update summary metrics
      setSummaryMetrics(prev => ({
        ...prev,
        totalExpenses: prev.totalExpenses + usage.cost,
        netProfit: prev.totalRevenue - (prev.totalExpenses + usage.cost),
        profitMargin: ((prev.totalRevenue - (prev.totalExpenses + usage.cost)) / prev.totalRevenue) * 100
      }));
      
      // Update profitable machines list
      fetchData();
      
    } catch (error) {
      console.error('Error updating profit report:', error);
    }
  };
  
  // Function to add meter reading and generate billing
  const handleAddMeterReading = async (newBilling: AMCBilling) => {
    try {
      // Insert into billing table
      const { data, error } = await supabase
        .from('amc_billing')
        .insert([{
          contract_id: newBilling.contract_id,
          machine_id: newBilling.machine_id,
          customer_id: newBilling.customer_id,
          customer_name: newBilling.customer_name,
          machine_model: newBilling.machine_model,
          machine_type: newBilling.machine_type,
          serial_number: newBilling.serial_number,
          department: newBilling.department,
          billing_month: newBilling.billing_month,
          a4_opening_reading: newBilling.a4_opening_reading,
          a4_closing_reading: newBilling.a4_closing_reading,
          a4_total_copies: newBilling.a4_total_copies,
          a4_free_copies: newBilling.a4_free_copies,
          a4_extra_copies: newBilling.a4_extra_copies,
          a4_extra_copy_rate: newBilling.a4_extra_copy_rate,
          a4_extra_copy_charge: newBilling.a4_extra_copy_charge,
          a3_opening_reading: newBilling.a3_opening_reading,
          a3_closing_reading: newBilling.a3_closing_reading,
          a3_total_copies: newBilling.a3_total_copies,
          a3_free_copies: newBilling.a3_free_copies,
          a3_extra_copies: newBilling.a3_extra_copies,
          a3_extra_copy_rate: newBilling.a3_extra_copy_rate,
          a3_extra_copy_charge: newBilling.a3_extra_copy_charge,
          gst_percent: newBilling.gst_percent,
          gst_amount: newBilling.gst_amount,
          rent: newBilling.rent,
          rent_gst: newBilling.rent_gst,
          total_bill: newBilling.total_bill,
          bill_date: newBilling.bill_date,
          bill_status: newBilling.bill_status,
          invoice_no: newBilling.invoice_no
        }])
        .select();
      
      if (error) throw error;
      
      // Update machine's last readings
      const { data: updateData, error: updateError } = await supabase
        .from('amc_machines')
        .update({
          last_a4_reading: newBilling.a4_closing_reading,
          last_a3_reading: newBilling.a3_closing_reading,
          last_reading_date: newBilling.bill_date
        })
        .eq('id', newBilling.machine_id)
        .select();
      
      if (updateError) throw updateError;
      
      // Update state
      setBillingData(prevBilling => [...prevBilling, newBilling]);
      
      // Update machines state
      setMachines(prevMachines => prevMachines.map(machine => 
        machine.id === newBilling.machine_id 
          ? { 
              ...machine, 
              last_a4_reading: newBilling.a4_closing_reading,
              last_a3_reading: newBilling.a3_closing_reading,
              last_reading_date: newBilling.bill_date
            } 
          : machine
      ));
      
      // Update profit report for extra copies income
      await updateProfitReportForBilling(newBilling);
      
      toast.success("Meter reading saved and bill generated successfully");
    } catch (error) {
      console.error('Error adding meter reading:', error);
      toast.error('Failed to add meter reading');
    }
  };
  
  // Update profit report when adding billing/meter reading
  const updateProfitReportForBilling = async (billing: AMCBilling) => {
    try {
      const billingMonth = new Date(billing.billing_month).toISOString().split('T')[0].substring(0, 7) + '-01'; // YYYY-MM-01 format
      
      // Check if report exists for this machine and month
      const { data: existingReports, error: reportQueryError } = await supabase
        .from('amc_profit_reports')
        .select('*')
        .eq('machine_id', billing.machine_id)
        .eq('month', billingMonth);
      
      if (reportQueryError) throw reportQueryError;
      
      const extraCopyIncome = billing.a4_extra_copy_charge + (billing.a3_extra_copy_charge || 0);
      
      if (existingReports && existingReports.length > 0) {
        // Update existing report
        const report = existingReports[0];
        const newExtraCopyIncome = extraCopyIncome;
        const newTotalIncome = report.rent_received + newExtraCopyIncome;
        const newProfit = newTotalIncome - report.total_expense;
        const newProfitMargin = (newProfit / newTotalIncome) * 100;
        
        const { data, error } = await supabase
          .from('amc_profit_reports')
          .update({
            extra_copy_income: newExtraCopyIncome,
            total_income: newTotalIncome,
            profit: newProfit,
            profit_margin: newProfitMargin
          })
          .eq('id', report.id)
          .select();
        
        if (error) throw error;
        
        // Update state
        setProfitReports(prev => prev.map(r => 
          r.id === report.id ? { ...r, 
            extra_copy_income: newExtraCopyIncome,
            total_income: newTotalIncome,
            profit: newProfit,
            profit_margin: newProfitMargin
          } : r
        ));
      } else {
        // Create new report
        const newReport: AMCProfitReport = {
          id: billing.id, // Use the same ID as the billing for simplicity
          contract_id: billing.contract_id,
          machine_id: billing.machine_id,
          customer_id: billing.customer_id,
          customer_name: billing.customer_name,
          machine_model: billing.machine_model,
          machine_type: billing.machine_type,
          serial_number: billing.serial_number,
          department: billing.department,
          month: billingMonth,
          rent_received: billing.rent,
          extra_copy_income: extraCopyIncome,
          total_income: billing.rent + extraCopyIncome,
          consumables_cost: 0, // Will be updated when consumables are added
          engineer_visit_cost: 0,
          travel_expense: 0,
          food_expense: 0,
          other_expense: 0,
          total_expense: 0,
          profit: billing.rent + extraCopyIncome,
          profit_margin: 100, // 100% profit initially since no expenses yet
          created_at: new Date().toISOString()
        };
        
        const { data, error } = await supabase
          .from('amc_profit_reports')
          .insert([{
            contract_id: newReport.contract_id,
            machine_id: newReport.machine_id,
            customer_id: newReport.customer_id,
            customer_name: newReport.customer_name,
            machine_model: newReport.machine_model,
            machine_type: newReport.machine_type,
            serial_number: newReport.serial_number,
            department: newReport.department,
            month: newReport.month,
            rent_received: newReport.rent_received,
            extra_copy_income: newReport.extra_copy_income,
            total_income: newReport.total_income,
            consumables_cost: newReport.consumables_cost,
            engineer_visit_cost: newReport.engineer_visit_cost,
            travel_expense: newReport.travel_expense,
            food_expense: newReport.food_expense,
            other_expense: newReport.other_expense,
            total_expense: newReport.total_expense,
            profit: newReport.profit,
            profit_margin: newReport.profit_margin
          }])
          .select();
        
        if (error) throw error;
        
        // Update state
        if (data && data.length > 0) {
          setProfitReports(prev => [...prev, data[0] as AMCProfitReport]);
        }
      }
      
      // Update summary metrics
      if (extraCopyIncome > 0) {
        setSummaryMetrics(prev => {
          const newRevenue = prev.totalRevenue + extraCopyIncome;
          const newProfit = newRevenue - prev.totalExpenses;
          return {
            totalRevenue: newRevenue,
            totalExpenses: prev.totalExpenses,
            netProfit: newProfit,
            profitMargin: (newProfit / newRevenue) * 100
          };
        });
      }
      
      // Update profitable machines list
      fetchData();
      
    } catch (error) {
      console.error('Error updating profit report:', error);
    }
  };
  
  // Function to generate a PDF invoice
  const generateInvoice = async (billing: AMCBilling) => {
    try {
      // Generate invoice number if not exists
      const invoiceNo = billing.invoice_no || 
        `INV/${new Date().getFullYear()}/${new Date().getMonth() + 1}/${billing.id.substring(0, 4)}`;
      
      // Update billing record
      const { data, error } = await supabase
        .from('amc_billing')
        .update({
          bill_status: "Generated",
          invoice_no: invoiceNo
        })
        .eq('id', billing.id)
        .select();
      
      if (error) throw error;
      
      // Update state
      setBillingData(prev => prev.map(bill => 
        bill.id === billing.id 
          ? { ...bill, bill_status: "Generated", invoice_no: invoiceNo } 
          : bill
      ));
      
      toast.success(`Invoice ${invoiceNo} generated for ${billing.customerName}`);
    } catch (error) {
      console.error('Error generating invoice:', error);
      toast.error('Failed to generate invoice');
    }
  };
  
  // Function to print an invoice
  const printInvoice = (billing: AMCBilling) => {
    if (!billing.invoice_no) {
      toast.error("Please generate an invoice first");
      return;
    }
    
    toast.success(`Printing invoice ${billing.invoice_no} for ${billing.customerName}`);
    // In a real app, this would open a print dialog with the invoice PDF
  };
  
  // Function to generate a profit report
  const generateProfitReport = () => {
    toast.success("Profit report generated successfully");
    // In a real app, this would generate a detailed profit report
  };
  
  // Filter function for search across all tabs
  const filterItems = (items: any[], query: string) => {
    if (!query) return items;
    
    return items.filter(item => 
      Object.values(item).some(value => 
        value !== null && 
        value !== undefined &&
        value.toString().toLowerCase().includes(query.toLowerCase())
      )
    );
  };
  
  // Filtered data based on search query
  const filteredContracts = filterItems(contracts, searchQuery);
  const filteredMachines = filterItems(machines, searchQuery);
  const filteredUsage = filterItems(consumableUsage, searchQuery);
  const filteredBilling = filterItems(billingData, searchQuery);
  const filteredReports = filterItems(profitReports, searchQuery);

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AMC Consumable Tracker</h1>
          <p className="text-muted-foreground">
            Track consumables and manage AMC/Rental contracts
          </p>
        </div>
        <AddContractDialog onContractAdded={handleAddContract} />
      </div>

      {/* Search and filter row */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search contracts, machines, or consumables..."
            className="pl-8 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Button variant="outline" className="sm:ml-auto flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filters
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 grid grid-cols-2 md:grid-cols-5">
          <TabsTrigger value="contracts">AMC Contracts</TabsTrigger>
          <TabsTrigger value="machines">Machines</TabsTrigger>
          <TabsTrigger value="consumables">Consumable Usage</TabsTrigger>
          <TabsTrigger value="billing">Monthly Billing</TabsTrigger>
          <TabsTrigger value="reports">Profit Reports</TabsTrigger>
        </TabsList>

        {/* AMC Contracts Tab */}
        <TabsContent value="contracts">
          <Card>
            <CardHeader>
              <CardTitle>AMC & Rental Contracts</CardTitle>
              <CardDescription>Manage all customer AMC and rental agreements</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Machine Model</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Monthly Rent</TableHead>
                    <TableHead>Copy Limit</TableHead>
                    <TableHead>Billing Cycle</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-4">Loading contracts...</TableCell>
                    </TableRow>
                  ) : filteredContracts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-4">No contracts found</TableCell>
                    </TableRow>
                  ) : (
                    filteredContracts.map((contract) => (
                      <TableRow key={contract.id}>
                        <TableCell className="font-medium">{contract.customerName}</TableCell>
                        <TableCell>{contract.machineModel}</TableCell>
                        <TableCell>
                          <Badge variant={contract.contractType === "AMC" ? "outline" : "secondary"}>
                            {contract.contractType}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(contract.startDate).toLocaleDateString()} - 
                          {new Date(contract.endDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>₹{contract.monthlyRent.toLocaleString()}</TableCell>
                        <TableCell>{contract.copyLimitA4.toLocaleString()}</TableCell>
                        <TableCell>{contract.billingCycle}</TableCell>
                        <TableCell>
                          <Badge variant="success">{contract.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <FileText className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Contract
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Printer className="h-4 w-4 mr-2" />
                                Print Contract
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <File className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Machines Tab */}
        <TabsContent value="machines">
          <Card>
            <CardHeader>
              <CardTitle>Machines on AMC/Rental</CardTitle>
              <CardDescription>All machines under active contracts</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Machine Model</TableHead>
                    <TableHead>Serial Number</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Contract Type</TableHead>
                    <TableHead>Current Rent</TableHead>
                    <TableHead>Last Reading</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-4">Loading machines...</TableCell>
                    </TableRow>
                  ) : filteredMachines.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-4">No machines found</TableCell>
                    </TableRow>
                  ) : (
                    filteredMachines.map((machine) => (
                      <TableRow key={machine.id}>
                        <TableCell className="font-medium">{machine.customerName}</TableCell>
                        <TableCell>{machine.model}</TableCell>
                        <TableCell>{machine.serialNumber}</TableCell>
                        <TableCell>{machine.machineType}</TableCell>
                        <TableCell>{machine.location}</TableCell>
                        <TableCell>
                          <Badge variant={machine.contractType === "AMC" ? "outline" : "secondary"}>
                            {machine.contractType}
                          </Badge>
                        </TableCell>
                        <TableCell>₹{machine.currentRent.toLocaleString()}</TableCell>
                        <TableCell>
                          A4: {machine.last_a4_reading?.toLocaleString() || 0}
                          {machine.machineType === "Color" && `, A3: ${machine.last_a3_reading?.toLocaleString() || 0}`}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <FileText className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setActiveTab("billing")}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Meter Reading
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Machine
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <File className="h-4 w-4 mr-2" />
                                View History
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Consumable Usage Tab */}
        <TabsContent value="consumables">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Consumable Usage</CardTitle>
                  <CardDescription>Track inventory used on AMC/Rental machines</CardDescription>
                </div>
                <AddConsumableUsageDialog onUsageAdded={handleAddConsumableUsage} />
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Machine</TableHead>
                    <TableHead>Serial Number</TableHead>
                    <TableHead>Engineer</TableHead>
                    <TableHead>Consumable</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-4">Loading consumable usage...</TableCell>
                    </TableRow>
                  ) : filteredUsage.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-4">No consumable usage found</TableCell>
                    </TableRow>
                  ) : (
                    filteredUsage.map((usage) => (
                      <TableRow key={usage.id}>
                        <TableCell>{new Date(usage.date).toLocaleDateString()}</TableCell>
                        <TableCell className="font-medium">{usage.customerName}</TableCell>
                        <TableCell>{usage.machineModel}</TableCell>
                        <TableCell>{usage.serialNumber}</TableCell>
                        <TableCell>{usage.engineerName || "N/A"}</TableCell>
                        <TableCell>{usage.itemName}</TableCell>
                        <TableCell>{usage.quantity}</TableCell>
                        <TableCell>₹{usage.cost.toLocaleString()}</TableCell>
                        <TableCell>{usage.remarks || "N/A"}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Monthly Billing Tab */}
        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Monthly Usage & Billing</CardTitle>
                  <CardDescription>Record meter readings and generate invoices</CardDescription>
                </div>
                <AddMeterReadingDialog onMeterReadingAdded={handleAddMeterReading} />
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Machine</TableHead>
                    <TableHead>Readings (A4)</TableHead>
                    <TableHead>Extra Copies</TableHead>
                    <TableHead>Extra Charges</TableHead>
                    <TableHead>Rent</TableHead>
                    <TableHead>Total Bill</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-4">Loading billing data...</TableCell>
                    </TableRow>
                  ) : filteredBilling.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-4">No billing data found</TableCell>
                    </TableRow>
                  ) : (
                    filteredBilling.map((bill) => (
                      <TableRow key={bill.id}>
                        <TableCell>{new Date(bill.billing_month).toLocaleDateString('default', { month: 'long', year: 'numeric' })}</TableCell>
                        <TableCell className="font-medium">{bill.customerName}</TableCell>
                        <TableCell>{bill.machineModel}</TableCell>
                        <TableCell>
                          {bill.a4_opening_reading.toLocaleString()} → {bill.a4_closing_reading.toLocaleString()}
                        </TableCell>
                        <TableCell>{bill.a4_extra_copies.toLocaleString()}</TableCell>
                        <TableCell>₹{bill.a4_extra_copy_charge.toLocaleString()}</TableCell>
                        <TableCell>₹{bill.rent.toLocaleString()}</TableCell>
                        <TableCell>₹{bill.total_bill.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={bill.bill_status === "Generated" ? "success" : bill.bill_status === "Paid" ? "default" : "outline"}
                          >
                            {bill.bill_status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <FileText className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {bill.bill_status === "Pending" && (
                                <DropdownMenuItem onClick={() => generateInvoice(bill)}>
                                  <File className="h-4 w-4 mr-2" />
                                  Generate Invoice
                                </DropdownMenuItem>
                              )}
                              {bill.bill_status !== "Pending" && (
                                <DropdownMenuItem onClick={() => printInvoice(bill)}>
                                  <Printer className="h-4 w-4 mr-2" />
                                  Print Invoice
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem>
                                <Download className="h-4 w-4 mr-2" />
                                Download PDF
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profit Reports Tab */}
        <TabsContent value="reports">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-5">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Total AMC Revenue</h3>
              <div className="text-2xl font-bold">₹{summaryMetrics.totalRevenue.toLocaleString()}</div>
              <div className="flex items-center text-xs text-green-600 mt-1">
                <span className="mr-1">↑</span>
                <span>Monthly income from contracts</span>
              </div>
            </Card>

            <Card className="p-5">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Expenses</h3>
              <div className="text-2xl font-bold">₹{summaryMetrics.totalExpenses.toLocaleString()}</div>
              <div className="flex items-center text-xs text-red-600 mt-1">
                <span className="mr-1">↑</span>
                <span>Consumables & other costs</span>
              </div>
            </Card>

            <Card className="p-5">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Net Profit</h3>
              <div className="text-2xl font-bold">₹{summaryMetrics.netProfit.toLocaleString()}</div>
              <div className="flex items-center text-xs text-green-600 mt-1">
                <span className="mr-1">↑</span>
                <span>Total revenue minus expenses</span>
              </div>
            </Card>

            <Card className="p-5">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Average Profit Margin</h3>
              <div className="text-2xl font-bold">{summaryMetrics.profitMargin.toFixed(1)}%</div>
              <div className="flex items-center text-xs text-green-600 mt-1">
                <span className="mr-1">↑</span>
                <span>Profit as % of revenue</span>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="col-span-2">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>AMC Profit & Expense Report</CardTitle>
                    <CardDescription>Machine-wise profit analysis</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" className="flex items-center gap-2" onClick={generateProfitReport}>
                    <BarChart2 className="h-4 w-4" />
                    Generate Report
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Month</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Machine</TableHead>
                      <TableHead>Rent</TableHead>
                      <TableHead>Extra Copy Income</TableHead>
                      <TableHead>Total Income</TableHead>
                      <TableHead>Expenses</TableHead>
                      <TableHead>Profit</TableHead>
                      <TableHead>Margin</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-4">Loading profit reports...</TableCell>
                      </TableRow>
                    ) : filteredReports.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-4">No profit reports found</TableCell>
                      </TableRow>
                    ) : (
                      filteredReports.map((report) => (
                        <TableRow key={report.id}>
                          <TableCell>{new Date(report.month).toLocaleDateString('default', { month: 'long', year: 'numeric' })}</TableCell>
                          <TableCell className="font-medium">{report.customerName}</TableCell>
                          <TableCell>{report.machineModel}</TableCell>
                          <TableCell>₹{report.rent_received.toLocaleString()}</TableCell>
                          <TableCell>₹{report.extra_copy_income.toLocaleString()}</TableCell>
                          <TableCell>₹{report.total_income.toLocaleString()}</TableCell>
                          <TableCell>₹{report.total_expense.toLocaleString()}</TableCell>
                          <TableCell className={report.profit >= 0 ? "text-green-600" : "text-red-600"}>
                            ₹{report.profit.toLocaleString()}
                          </TableCell>
                          <TableCell className={report.profit_margin >= 0 ? "text-green-600" : "text-red-600"}>
                            {report.profit_margin.toFixed(1)}%
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Profitable AMC Machines</CardTitle>
                <CardDescription>Based on current month data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isLoading ? (
                    <div className="text-center py-4">Loading profitable machines...</div>
                  ) : profitableMachines.length === 0 ? (
                    <div className="text-center py-4">No profitable machines data available</div>
                  ) : (
                    profitableMachines.map((machine, index) => (
                      <div key={machine.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full border bg-background">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{machine.machineModel}</p>
                            <p className="text-sm text-muted-foreground">{machine.customerName}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">₹{machine.profit.toLocaleString()}</p>
                          <p className="text-sm text-green-600">{machine.profitMargin.toFixed(1)}%</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AmcTracker;
