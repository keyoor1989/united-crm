
import React from "react";
import { Route } from "react-router-dom";
import TaskEnabledLayout from "@/components/layout/TaskEnabledLayout";
import Inventory from "@/pages/Inventory";
import InventoryItems from "@/pages/inventory/InventoryItems";
import InventoryPurchase from "@/pages/inventory/InventoryPurchase";
import UnifiedPurchase from "@/pages/inventory/UnifiedPurchase";
import InventoryCashPurchase from "@/pages/inventory/CashPurchase";
import InventoryIssue from "@/pages/inventory/InventoryIssue";
import IssueInventory from "@/pages/inventory/IssueInventory";
import InventoryReturns from "@/pages/inventory/InventoryReturns";
import InventorySales from "@/pages/inventory/InventorySales";
import SalesReports from "@/pages/inventory/SalesReports";
import ProfitReport from "@/pages/inventory/ProfitReport";
import InventoryHistory from "@/pages/inventory/InventoryHistory";
import InventoryVendors from "@/pages/inventory/InventoryVendors";
import VendorPerformance from "@/pages/inventory/VendorPerformance";
import VendorPerformanceDemo from "@/pages/inventory/VendorPerformanceDemo";
import InventoryWarehouses from "@/pages/inventory/InventoryWarehouses";
import InventoryBrands from "@/pages/inventory/InventoryBrands";
import InventoryAlerts from "@/pages/inventory/InventoryAlerts";
import InventoryAmcTracker from "@/pages/inventory/AmcTracker";
import InventoryBranchTransfer from "@/pages/inventory/BranchTransfer";
import WarehouseTransfer from "@/pages/inventory/WarehouseTransfer";
import InventoryTransfer from "@/pages/inventory/InventoryTransfer";

export const InventoryRoutes = () => {
  return (
    <>
      <Route
        path="inventory"
        element={
          <TaskEnabledLayout>
            <Inventory />
          </TaskEnabledLayout>
        }
      />
      <Route
        path="inventory/items"
        element={
          <TaskEnabledLayout>
            <InventoryItems />
          </TaskEnabledLayout>
        }
      />
      <Route
        path="inventory/purchase"
        element={
          <TaskEnabledLayout>
            <InventoryPurchase />
          </TaskEnabledLayout>
        }
      />
      <Route
        path="inventory/unified-purchase"
        element={
          <TaskEnabledLayout>
            <UnifiedPurchase />
          </TaskEnabledLayout>
        }
      />
      <Route
        path="inventory/cash-purchase"
        element={
          <TaskEnabledLayout>
            <InventoryCashPurchase />
          </TaskEnabledLayout>
        }
      />
      <Route
        path="inventory/issue"
        element={
          <TaskEnabledLayout>
            <InventoryIssue />
          </TaskEnabledLayout>
        }
      />
      <Route
        path="inventory/issue-inventory"
        element={
          <TaskEnabledLayout>
            <IssueInventory />
          </TaskEnabledLayout>
        }
      />
      <Route
        path="inventory/returns"
        element={
          <TaskEnabledLayout>
            <InventoryReturns />
          </TaskEnabledLayout>
        }
      />
      <Route
        path="inventory/sales"
        element={
          <TaskEnabledLayout>
            <InventorySales />
          </TaskEnabledLayout>
        }
      />
      <Route
        path="inventory/sales-reports"
        element={
          <TaskEnabledLayout>
            <SalesReports />
          </TaskEnabledLayout>
        }
      />
      <Route
        path="inventory/profit-report"
        element={
          <TaskEnabledLayout>
            <ProfitReport />
          </TaskEnabledLayout>
        }
      />
      <Route
        path="inventory/history"
        element={
          <TaskEnabledLayout>
            <InventoryHistory />
          </TaskEnabledLayout>
        }
      />
      <Route
        path="inventory/vendors"
        element={
          <TaskEnabledLayout>
            <InventoryVendors />
          </TaskEnabledLayout>
        }
      />
      <Route
        path="inventory/vendor-performance"
        element={
          <TaskEnabledLayout>
            <VendorPerformance />
          </TaskEnabledLayout>
        }
      />
      <Route
        path="inventory/vendor-performance-demo"
        element={
          <TaskEnabledLayout>
            <VendorPerformanceDemo />
          </TaskEnabledLayout>
        }
      />
      <Route
        path="inventory/warehouses"
        element={
          <TaskEnabledLayout>
            <InventoryWarehouses />
          </TaskEnabledLayout>
        }
      />
      <Route
        path="inventory/brands"
        element={
          <TaskEnabledLayout>
            <InventoryBrands />
          </TaskEnabledLayout>
        }
      />
      <Route
        path="inventory/alerts"
        element={
          <TaskEnabledLayout>
            <InventoryAlerts />
          </TaskEnabledLayout>
        }
      />
      <Route
        path="inventory/amc-tracker"
        element={
          <TaskEnabledLayout>
            <InventoryAmcTracker />
          </TaskEnabledLayout>
        }
      />
      <Route
        path="inventory/branch-transfer"
        element={
          <TaskEnabledLayout>
            <InventoryBranchTransfer />
          </TaskEnabledLayout>
        }
      />
      <Route
        path="inventory/warehouse-transfer"
        element={
          <TaskEnabledLayout>
            <WarehouseTransfer />
          </TaskEnabledLayout>
        }
      />
      <Route
        path="inventory/transfer"
        element={
          <TaskEnabledLayout>
            <InventoryTransfer />
          </TaskEnabledLayout>
        }
      />
    </>
  );
};
