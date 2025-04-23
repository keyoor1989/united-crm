
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import UnifiedPurchase from './pages/inventory/UnifiedPurchase';
import InventoryItems from './pages/inventory/InventoryItems';
import InventoryVendors from './pages/inventory/InventoryVendors';
import Layout from './components/layout/Layout';
import TaskEnabledLayout from './components/layout/TaskEnabledLayout';

// Import customer pages
import Customers from './pages/Customers';
import CustomerForm from './pages/CustomerForm';
import CustomerFollowUps from './pages/customers/CustomerFollowUps';

// Import service pages
import Service from './pages/Service';
import ServiceCallForm from './pages/ServiceCallForm';
import ServiceBilling from './pages/ServiceBilling';
import ServiceInventoryManagement from './pages/ServiceInventoryManagement';
import EngineerPerformanceDashboard from './pages/EngineerPerformanceDashboard';

// Import sales pages
import Quotations from './pages/sales/Quotations';
import QuotationForm from './pages/sales/QuotationForm';
import PurchaseOrders from './pages/sales/PurchaseOrders';
import SentQuotations from './pages/sales/SentQuotations';
import SentOrders from './pages/sales/SentOrders';
import OrderHistory from './pages/sales/OrderHistory';
import QuotationProducts from './pages/sales/QuotationProducts';
import ContractUpload from './pages/sales/ContractUpload';
import PurchaseOrderForm from './pages/sales/PurchaseOrderForm';

// Import finance pages
import FinanceDashboard from './pages/finance/FinanceDashboard';
import CashRegister from './pages/finance/CashRegister';
import DepartmentRevenue from './pages/finance/DepartmentRevenue';
import DepartmentExpenses from './pages/finance/DepartmentExpenses';
import CustomerPayments from './pages/finance/CustomerPayments';
import OutstandingReceivables from './pages/finance/OutstandingReceivables';
import PendingReceivables from './pages/finance/PendingReceivables';

// Import inventory pages
import InventoryBrands from './pages/inventory/InventoryBrands';
import InventoryWarehouses from './pages/inventory/InventoryWarehouses';
import CashPurchase from './pages/inventory/CashPurchase';
import InventorySales from './pages/inventory/InventorySales';
import SalesReports from './pages/inventory/SalesReports';
import InventoryHistory from './pages/inventory/InventoryHistory';
import BranchTransfer from './pages/inventory/BranchTransfer';
import ProfitReport from './pages/inventory/ProfitReport';
import AmcTracker from './pages/inventory/AmcTracker';
import WarehouseTransfer from './pages/inventory/WarehouseTransfer';

// Import reports pages
import Reports from './pages/Reports';
import MachineRentalReport from './pages/reports/MachineRentalReport';
import EngineerServiceReport from './pages/reports/EngineerServiceReport';
import CustomerFollowUpReport from './pages/reports/CustomerFollowUpReport';
import BranchProfitReport from './pages/reports/BranchProfitReport';

// Import tasks pages
import TaskDashboard from './pages/tasks/TaskDashboard';

// Import settings & other pages
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import SmartAssistant from './pages/SmartAssistant';
import TelegramAdmin from './pages/TelegramAdmin';
import UserManagement from './pages/user-management/UserManagement';

// Import location pages
import LocationIndore from './pages/locations/LocationIndore';
import LocationBhopal from './pages/locations/LocationBhopal';
import LocationJabalpur from './pages/locations/LocationJabalpur';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Routes that need TaskProvider */}
      <Route element={<TaskEnabledLayout />}>
        {/* Dashboard - needs tasks */}
        <Route path="/" element={<Dashboard />} />
        
        {/* Tasks routes */}
        <Route path="/tasks" element={<TaskDashboard />} />
      </Route>
      
      {/* Standard routes without task context */}
      <Route element={<Layout />}>
        {/* Customer Management */}
        <Route path="/customers" element={<Customers />} />
        <Route path="/customer-form" element={<CustomerForm />} />
        <Route path="/customers/follow-ups" element={<CustomerFollowUps />} />
        
        {/* Service Management */}
        <Route path="/service" element={<Service />} />
        <Route path="/service-call-form" element={<ServiceCallForm />} />
        <Route path="/service-billing" element={<ServiceBilling />} />
        <Route path="/service-inventory" element={<ServiceInventoryManagement />} />
        <Route path="/engineer-performance" element={<EngineerPerformanceDashboard />} />
        
        {/* Sales Management */}
        <Route path="/quotations" element={<Quotations />} />
        <Route path="/quotation-form" element={<QuotationForm />} />
        <Route path="/purchase-orders" element={<PurchaseOrders />} />
        <Route path="/purchase-order-form" element={<PurchaseOrderForm />} />
        <Route path="/sent-quotations" element={<SentQuotations />} />
        <Route path="/sent-orders" element={<SentOrders />} />
        <Route path="/order-history" element={<OrderHistory />} />
        <Route path="/quotation-products" element={<QuotationProducts />} />
        <Route path="/contract-upload" element={<ContractUpload />} />
        
        {/* Finance Management */}
        <Route path="/finance" element={<FinanceDashboard />} />
        <Route path="/finance/cash-register" element={<CashRegister />} />
        <Route path="/finance/revenue" element={<DepartmentRevenue />} />
        <Route path="/finance/expenses" element={<DepartmentExpenses />} />
        <Route path="/finance/payments" element={<CustomerPayments />} />
        <Route path="/finance/receivables" element={<OutstandingReceivables />} />
        <Route path="/finance/pending-receivables" element={<PendingReceivables />} />
        
        {/* Inventory Management */}
        <Route path="/inventory/items" element={<InventoryItems />} />
        <Route path="/inventory/brands" element={<InventoryBrands />} />
        <Route path="/inventory/vendors" element={<InventoryVendors />} />
        <Route path="/inventory/warehouses" element={<InventoryWarehouses />} />
        <Route path="/inventory/purchase" element={<UnifiedPurchase />} />
        <Route path="/inventory/purchase-entry" element={<UnifiedPurchase />} />
        <Route path="/inventory/cash-purchase" element={<CashPurchase />} />
        <Route path="/inventory/sales" element={<InventorySales />} />
        <Route path="/inventory/sales-reports" element={<SalesReports />} />
        <Route path="/inventory/transfers" element={<InventoryHistory />} />
        <Route path="/inventory/branch-transfer" element={<BranchTransfer />} />
        <Route path="/inventory/warehouse-transfer" element={<WarehouseTransfer />} />
        <Route path="/inventory/profit-report" element={<ProfitReport />} />
        <Route path="/inventory/amc-tracker" element={<AmcTracker />} />
        
        {/* Reports */}
        <Route path="/reports" element={<Reports />} />
        <Route path="/reports/machine-rental" element={<MachineRentalReport />} />
        <Route path="/reports/engineer-service" element={<EngineerServiceReport />} />
        <Route path="/reports/customer-followup" element={<CustomerFollowUpReport />} />
        <Route path="/reports/branch-profit" element={<BranchProfitReport />} />
        
        {/* Settings & Other */}
        <Route path="/settings" element={<Settings />} />
        <Route path="/smart-assistant" element={<SmartAssistant />} />
        <Route path="/telegram-admin" element={<TelegramAdmin />} />
        <Route path="/user-management" element={<UserManagement />} />
        
        {/* Locations */}
        <Route path="/locations/indore" element={<LocationIndore />} />
        <Route path="/locations/bhopal" element={<LocationBhopal />} />
        <Route path="/locations/jabalpur" element={<LocationJabalpur />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
