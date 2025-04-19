import React from 'react';
import { Route, Routes, BrowserRouter } from 'react-router-dom';
import InventoryDashboard from './pages/inventory/InventoryDashboard';
import InventoryItems from './pages/inventory/InventoryItems';
import InventoryVendors from './pages/inventory/InventoryVendors';
import InventoryModels from './pages/inventory/InventoryModels';
import InventoryBrands from './pages/inventory/InventoryBrands';
import InventoryWarehouses from './pages/inventory/InventoryWarehouses';
import InventoryAdjustments from './pages/inventory/InventoryAdjustments';
import InventoryReturns from './pages/inventory/InventoryReturns';
import InventoryTransfers from './pages/inventory/InventoryTransfers';
import InventoryPurchase from './pages/inventory/InventoryPurchase';
import SalesDashboard from './pages/sales/SalesDashboard';
import SalesQuotations from './pages/sales/SalesQuotations';
import SalesOrders from './pages/sales/SalesOrders';
import SalesInvoices from './pages/sales/SalesInvoices';
import SalesCustomers from './pages/sales/SalesCustomers';
import SalesReports from './pages/sales/SalesReports';
import SalesPayments from './pages/sales/SalesPayments';
import SalesShipments from './pages/sales/SalesShipments';
import SalesCreditNotes from './pages/sales/SalesCreditNotes';
import SalesRefunds from './pages/sales/SalesRefunds';
import AMCDashboard from './pages/amc/AMCDashboard';
import AMCClients from './pages/amc/AMCClients';
import AMCMachines from './pages/amc/AMCMachines';
import AMCContracts from './pages/amc/AMCContracts';
import AMCBilling from './pages/amc/AMCBilling';
import AMCReports from './pages/amc/AMCReports';
import AMCConsumables from './pages/amc/AMCConsumables';
import SettingsProfile from './pages/settings/SettingsProfile';
import SettingsUsers from './pages/settings/SettingsUsers';
import SettingsRoles from './pages/settings/SettingsRoles';
import SettingsTaxes from './pages/settings/SettingsTaxes';
import SettingsEmail from './pages/settings/SettingsEmail';
import SettingsIntegrations from './pages/settings/SettingsIntegrations';
import SettingsNotifications from './pages/settings/SettingsNotifications';
import SettingsTemplates from './pages/settings/SettingsTemplates';
import SettingsDataManagement from './pages/settings/SettingsDataManagement';
import SettingsAuditLog from './pages/settings/SettingsAuditLog';
import PurchaseOrders from './pages/sales/PurchaseOrders';
import SalesPage from './pages/sales/SalesPage';
import CreditSales from './pages/sales/CreditSales';
import CashSales from './pages/sales/CashSales';
import UnifiedPurchase from './pages/inventory/UnifiedPurchase';

const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Inventory Management */}
        <Route path="/inventory/dashboard" element={<InventoryDashboard />} />
        <Route path="/inventory/items" element={<InventoryItems />} />
        <Route path="/inventory/vendors" element={<InventoryVendors />} />
        <Route path="/inventory/models" element={<InventoryModels />} />
        <Route path="/inventory/brands" element={<InventoryBrands />} />
        <Route path="/inventory/warehouses" element={<InventoryWarehouses />} />
        <Route path="/inventory/adjustments" element={<InventoryAdjustments />} />
        <Route path="/inventory/returns" element={<InventoryReturns />} />
        <Route path="/inventory/transfers" element={<InventoryTransfers />} />
        <Route path="/inventory/purchase" element={<UnifiedPurchase />} />

        {/* Sales Management */}
        <Route path="/sales/dashboard" element={<SalesDashboard />} />
        <Route path="/sales/salespage" element={<SalesPage />} />
        <Route path="/sales/quotations" element={<SalesQuotations />} />
        <Route path="/sales/orders" element={<SalesOrders />} />
        <Route path="/sales/invoices" element={<SalesInvoices />} />
        <Route path="/sales/customers" element={<SalesCustomers />} />
        <Route path="/sales/reports" element={<SalesReports />} />
        <Route path="/sales/payments" element={<SalesPayments />} />
        <Route path="/sales/shipments" element={<SalesShipments />} />
        <Route path="/sales/credit-notes" element={<SalesCreditNotes />} />
        <Route path="/sales/refunds" element={<SalesRefunds />} />
	      <Route path="/sales/purchase-orders" element={<PurchaseOrders />} />
        <Route path="/sales/credit-sales" element={<CreditSales />} />
        <Route path="/sales/cash-sales" element={<CashSales />} />

        {/* AMC Management */}
        <Route path="/amc/dashboard" element={<AMCDashboard />} />
        <Route path="/amc/clients" element={<AMCClients />} />
        <Route path="/amc/machines" element={<AMCMachines />} />
        <Route path="/amc/contracts" element={<AMCContracts />} />
        <Route path="/amc/billing" element={<AMCBilling />} />
        <Route path="/amc/reports" element={<AMCReports />} />
        <Route path="/amc/consumables" element={<AMCConsumables />} />

        {/* Settings */}
        <Route path="/settings/profile" element={<SettingsProfile />} />
        <Route path="/settings/users" element={<SettingsUsers />} />
        <Route path="/settings/roles" element={<SettingsRoles />} />
        <Route path="/settings/taxes" element={<SettingsTaxes />} />
        <Route path="/settings/email" element={<SettingsEmail />} />
        <Route path="/settings/integrations" element={<SettingsIntegrations />} />
        <Route path="/settings/notifications" element={<SettingsNotifications />} />
        <Route path="/settings/templates" element={<SettingsTemplates />} />
        <Route path="/settings/data-management" element={<SettingsDataManagement />} />
        <Route path="/settings/audit-log" element={<SettingsAuditLog />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
