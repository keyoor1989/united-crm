
import React from "react";
import { Routes, Route } from "react-router-dom";
import Dashboard from "@/pages/Dashboard";
import Customers from "@/pages/Customers";
import CustomerForm from "@/pages/CustomerForm";
import Service from "@/pages/Service";
import ServiceCallForm from "@/pages/ServiceCallForm";
import EngineerDetail from "@/pages/EngineerDetail";
import EngineerPerformanceDashboard from "@/pages/EngineerPerformanceDashboard";
import Inventory from "@/pages/Inventory";
import Chat from "@/pages/Chat";
import NotFound from "@/pages/NotFound";

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Dashboard />} />
    <Route path="/customers" element={<Customers />} />
    <Route path="/customer-form" element={<CustomerForm />} />
    <Route path="/service" element={<Service />} />
    <Route path="/service-call-form" element={<ServiceCallForm />} />
    <Route path="/engineer/:id" element={<EngineerDetail />} />
    <Route path="/engineer-performance" element={<EngineerPerformanceDashboard />} />
    <Route path="/inventory" element={<Inventory />} />
    <Route path="/chat" element={<Chat />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default AppRoutes;
