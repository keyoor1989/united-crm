
import React from "react";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./AppRoutes";
import { ToastProvider } from "./components/providers/ToastProvider";

const App = () => (
  <BrowserRouter>
    <ToastProvider>
      <AppRoutes />
    </ToastProvider>
  </BrowserRouter>
);

export default App;
