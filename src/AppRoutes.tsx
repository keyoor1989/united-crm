
import React from "react";
import { Routes, Route } from "react-router-dom";
import Dashboard from "@/pages/Dashboard";
import Customers from "@/pages/Customers";
import Service from "@/pages/Service";
import Inventory from "@/pages/Inventory";
import NotFound from "@/pages/NotFound";

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Dashboard />} />
    <Route path="/customers" element={<Customers />} />
    <Route path="/service" element={<Service />} />
    <Route path="/inventory" element={<Inventory />} />
    {/* TODO: Add other routes as we implement them */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default AppRoutes;
