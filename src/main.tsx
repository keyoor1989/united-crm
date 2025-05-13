
import React from "react";
import ReactDOM from "react-dom/client";
import { Capacitor } from "@capacitor/core";
import { SplashScreen } from "@capacitor/splash-screen";
import App from "./App";
import "./index.css";

// Hide splash screen when app is ready (mobile only)
if (Capacitor.isNativePlatform()) {
  SplashScreen.hide();
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
