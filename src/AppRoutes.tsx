
import React from 'react';
import { Route, Routes, BrowserRouter } from 'react-router-dom';
import UnifiedPurchase from './pages/inventory/UnifiedPurchase';
import InventoryItems from './pages/inventory/InventoryItems';
import InventoryVendors from './pages/inventory/InventoryVendors';

const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Inventory Management */}
        <Route path="/inventory/items" element={<InventoryItems />} />
        <Route path="/inventory/vendors" element={<InventoryVendors />} />
        <Route path="/inventory/purchase" element={<UnifiedPurchase />} />
        
        {/* Default route */}
        <Route path="/" element={<UnifiedPurchase />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
