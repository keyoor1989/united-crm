
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import UnifiedPurchase from './pages/inventory/UnifiedPurchase';
import InventoryItems from './pages/inventory/InventoryItems';
import InventoryVendors from './pages/inventory/InventoryVendors';
import Layout from './components/layout/Layout';

const AppRoutes: React.FC = () => {
  return (
    <Layout>
      <Routes>
        {/* Inventory Management */}
        <Route path="/inventory/items" element={<InventoryItems />} />
        <Route path="/inventory/vendors" element={<InventoryVendors />} />
        <Route path="/inventory/purchase" element={<UnifiedPurchase />} />
        
        {/* Default route */}
        <Route path="/" element={<InventoryItems />} />
      </Routes>
    </Layout>
  );
};

export default AppRoutes;
