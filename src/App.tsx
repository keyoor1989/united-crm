import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import Dashboard from "@/pages/Dashboard";
import ServiceCalls from "@/pages/ServiceCalls";
import ServiceCallForm from "@/pages/ServiceCallForm";
import ServiceBilling from "@/pages/ServiceBilling";
import ServiceInventoryManagement from "@/pages/ServiceInventoryManagement";
import Customers from "@/pages/Customers";
import CustomerForm from "@/pages/CustomerForm";
import CustomerFollowUps from "@/pages/CustomerFollowUps";
import InventoryDashboard from "@/pages/inventory/InventoryDashboard";
import InventoryItems from "@/pages/inventory/InventoryItems";
import MachineParts from "@/pages/inventory/MachineParts";
import Warehouses from "@/pages/inventory/Warehouses";
import Vendors from "@/pages/inventory/Vendors";
import PurchaseEntry from "@/pages/inventory/PurchaseEntry";
import InventoryIssue from "@/pages/inventory/InventoryIssue";
import StockTransfers from "@/pages/inventory/StockTransfers";
import Quotations from "@/pages/quotations/Quotations";
import QuotationDetails from "@/pages/quotations/QuotationDetails";
import NewQuotation from "@/pages/quotations/NewQuotation";
import ReportsDashboard from "@/pages/reports/ReportsDashboard";
import MachineRentalReport from "@/pages/reports/MachineRentalReport";
import EngineerServiceReport from "@/pages/reports/EngineerServiceReport";
import CustomerFollowUpReport from "@/pages/reports/CustomerFollowUpReport";
import BranchProfitReport from "@/pages/reports/BranchProfitReport";
import Tasks from "@/pages/tasks/Tasks";
import TaskDetails from "@/pages/tasks/TaskDetails";
import NewTask from "@/pages/tasks/NewTask";
import EngineerPerformance from "@/pages/EngineerPerformance";
import FinanceDashboard from "@/pages/finance/FinanceDashboard";
import RevenueReport from "@/pages/finance/RevenueReport";
import ExpensesReport from "@/pages/finance/ExpensesReport";
import PaymentsReport from "@/pages/finance/PaymentsReport";
import ReceivablesReport from "@/pages/finance/ReceivablesReport";
import CashFlowReport from "@/pages/finance/CashFlowReport";
import ProfitAndLossReport from "@/pages/finance/ProfitAndLossReport";
import BalanceSheetReport from "@/pages/finance/BalanceSheetReport";
import InventoryProfitReport from "@/pages/inventory/InventoryProfitReport";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="/service" element={<ServiceCalls />} />
          <Route path="/service-call-form" element={<ServiceCallForm />} />
          <Route path="/service-billing" element={<ServiceBilling />} />
          <Route path="/service-inventory" element={<ServiceInventoryManagement />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/customer-form" element={<CustomerForm />} />
          <Route path="/customers/follow-ups" element={<CustomerFollowUps />} />
          <Route path="/inventory" element={<InventoryDashboard />} />
          <Route path="/inventory/items" element={<InventoryItems />} />
          <Route path="/inventory/machine-parts" element={<MachineParts />} />
          <Route path="/inventory/warehouses" element={<Warehouses />} />
          <Route path="/inventory/vendors" element={<Vendors />} />
          <Route path="/inventory/purchase-entry" element={<PurchaseEntry />} />
          <Route path="/inventory/issue" element={<InventoryIssue />} />
          <Route path="/inventory/transfers" element={<StockTransfers />} />
          <Route path="/quotations" element={<Quotations />} />
          <Route path="/quotations/:id" element={<QuotationDetails />} />
          <Route path="/quotations/new" element={<NewQuotation />} />
          <Route path="/reports" element={<ReportsDashboard />} />
          <Route path="/reports/machine-rental" element={<MachineRentalReport />} />
          <Route path="/reports/engineer-service" element={<EngineerServiceReport />} />
          <Route path="/reports/customer-followup" element={<CustomerFollowUpReport />} />
          <Route path="/reports/branch-profit" element={<BranchProfitReport />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/tasks/:id" element={<TaskDetails />} />
          <Route path="/tasks/new" element={<NewTask />} />
          <Route path="/engineer-performance" element={<EngineerPerformance />} />
          <Route path="/finance/dashboard" element={<FinanceDashboard />} />
          <Route path="/finance/revenue" element={<RevenueReport />} />
          <Route path="/finance/expenses" element={<ExpensesReport />} />
          <Route path="/finance/payments" element={<PaymentsReport />} />
          <Route path="/finance/receivables" element={<ReceivablesReport />} />
          <Route path="/finance/cash-flow" element={<CashFlowReport />} />
          <Route path="/finance/profit-loss" element={<ProfitAndLossReport />} />
          <Route path="/finance/balance-sheet" element={<BalanceSheetReport />} />
          <Route path="/inventory/profit-report" element={<InventoryProfitReport />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
