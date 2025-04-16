
import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { Toaster } from "sonner";
import { ThemeProvider } from "./components/theme-provider";
import { AuthProvider } from "@/contexts/AuthContext";
import { TelegramProvider } from "@/contexts/TelegramContext";
import AppRoutes from "./AppRoutes";

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <Router>
        <AuthProvider>
          <TelegramProvider>
            <AppRoutes />
            <Toaster position="top-right" />
          </TelegramProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
