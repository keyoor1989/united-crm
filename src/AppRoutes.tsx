
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import UnifiedPurchase from './pages/inventory/UnifiedPurchase';
import InventoryItems from './pages/inventory/InventoryItems';
import InventoryVendors from './pages/inventory/InventoryVendors';
import Layout from './components/layout/Layout';

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

// Import finance pages
import FinanceDashboard from './pages/finance/FinanceDashboard';
import CashRegister from './pages/finance/CashRegister';
import DepartmentRevenue from './pages/finance/DepartmentRevenue';
import DepartmentExpenses from './pages/finance/DepartmentExpenses';
import CustomerPayments from './pages/finance/CustomerPayments';

// Import dashboard page
import Dashboard from './pages/Dashboard';

const AppRoutes: React.FC = () => {
  return (
    <Layout>
      <Routes>
        {/* Dashboard */}
        <Route path="/" element={<Dashboard />} />
        
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
        <Route path="/sent-quotations" element={<SentQuotations />} />
        <Route path="/sent-orders" element={<SentOrders />} />
        
        {/* Finance Management */}
        <Route path="/finance" element={<FinanceDashboard />} />
        <Route path="/finance/cash-register" element={<CashRegister />} />
        <Route path="/finance/revenue" element={<DepartmentRevenue />} />
        <Route path="/finance/expenses" element={<DepartmentExpenses />} />
        <Route path="/finance/payments" element={<CustomerPayments />} />
        
        {/* Inventory Management */}
        <Route path="/inventory/items" element={<InventoryItems />} />
        <Route path="/inventory/vendors" element={<InventoryVendors />} />
        <Route path="/inventory/purchase" element={<UnifiedPurchase />} />
      </Routes>
    </Layout>
  );
};

export default AppRoutes;
