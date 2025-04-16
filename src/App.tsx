
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { CustomerProvider } from "@/contexts/CustomerContext";
import { TelegramProvider } from "@/contexts/TelegramContext";

import Dashboard from "@/pages/Dashboard";
import Customers from "@/pages/Customers";
import CustomerDetail from "@/pages/CustomerDetail";
import Leads from "@/pages/Leads";
import Inventory from "@/pages/Inventory";
import InventoryDetail from "@/pages/InventoryDetail";
import Sales from "@/pages/Sales";
import ServiceCalls from "@/pages/ServiceCalls";
import ServiceCallDetail from "@/pages/ServiceCallDetail";
import FollowUps from "@/pages/FollowUps";
import Login from "@/pages/Login";
import Quotations from "@/pages/Quotations";
import QuotationDetail from "@/pages/QuotationDetail";
import CreateQuotation from "@/pages/CreateQuotation";
import CreateServiceCall from "@/pages/CreateServiceCall";
import AuthRoute from "@/components/auth/AuthRoute";
import Chat from "@/pages/Chat";
import TelegramAdmin from "@/pages/TelegramAdmin";
import PurchaseOrders from "@/pages/PurchaseOrders";
import PurchaseOrderDetail from "@/pages/PurchaseOrderDetail";
import Index from "@/pages/Index";

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <Router>
        <AuthProvider>
          <CustomerProvider>
            <TelegramProvider>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                
                <Route
                  path="/dashboard"
                  element={
                    <AuthRoute>
                      <Dashboard />
                    </AuthRoute>
                  }
                />
                
                <Route
                  path="/customers"
                  element={
                    <AuthRoute>
                      <Customers />
                    </AuthRoute>
                  }
                />
                
                <Route
                  path="/customers/:id"
                  element={
                    <AuthRoute>
                      <CustomerDetail />
                    </AuthRoute>
                  }
                />
                
                <Route
                  path="/leads"
                  element={
                    <AuthRoute>
                      <Leads />
                    </AuthRoute>
                  }
                />
                
                <Route
                  path="/followups"
                  element={
                    <AuthRoute>
                      <FollowUps />
                    </AuthRoute>
                  }
                />
                
                <Route
                  path="/inventory"
                  element={
                    <AuthRoute>
                      <Inventory />
                    </AuthRoute>
                  }
                />
                
                <Route
                  path="/inventory/:id"
                  element={
                    <AuthRoute>
                      <InventoryDetail />
                    </AuthRoute>
                  }
                />
                
                <Route
                  path="/purchase-orders"
                  element={
                    <AuthRoute>
                      <PurchaseOrders />
                    </AuthRoute>
                  }
                />
                
                <Route
                  path="/purchase-orders/:id"
                  element={
                    <AuthRoute>
                      <PurchaseOrderDetail />
                    </AuthRoute>
                  }
                />
                
                <Route
                  path="/sales"
                  element={
                    <AuthRoute>
                      <Sales />
                    </AuthRoute>
                  }
                />
                
                <Route
                  path="/service"
                  element={
                    <AuthRoute>
                      <ServiceCalls />
                    </AuthRoute>
                  }
                />
                
                <Route
                  path="/service/:id"
                  element={
                    <AuthRoute>
                      <ServiceCallDetail />
                    </AuthRoute>
                  }
                />
                
                <Route
                  path="/create-service-call"
                  element={
                    <AuthRoute>
                      <CreateServiceCall />
                    </AuthRoute>
                  }
                />
                
                <Route
                  path="/quotations"
                  element={
                    <AuthRoute>
                      <Quotations />
                    </AuthRoute>
                  }
                />
                
                <Route
                  path="/quotations/:id"
                  element={
                    <AuthRoute>
                      <QuotationDetail />
                    </AuthRoute>
                  }
                />
                
                <Route
                  path="/create-quotation"
                  element={
                    <AuthRoute>
                      <CreateQuotation />
                    </AuthRoute>
                  }
                />
                
                <Route
                  path="/chat"
                  element={
                    <AuthRoute>
                      <Chat />
                    </AuthRoute>
                  }
                />
                
                <Route
                  path="/telegram-admin"
                  element={
                    <AuthRoute>
                      <TelegramAdmin />
                    </AuthRoute>
                  }
                />
              </Routes>
              <Toaster position="top-right" />
            </TelegramProvider>
          </CustomerProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
