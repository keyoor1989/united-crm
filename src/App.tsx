
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "@/pages/Dashboard";
import Customers from "@/pages/Customers";
import Service from "@/pages/Service";
import Inventory from "@/pages/Inventory";
import NotFound from "@/pages/NotFound";

const App = () => (
  <>
    <Toaster />
    <Sonner />
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/service" element={<Service />} />
        <Route path="/inventory" element={<Inventory />} />
        {/* TODO: Add other routes as we implement them */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </>
);

export default App;
