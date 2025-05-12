
import React from "react";
import { Route } from "react-router-dom";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import AccessDenied from "@/pages/AccessDenied";
import NotFound from "@/pages/NotFound";

export const AuthRoutes = () => {
  return (
    <>
      <Route path="login" element={<Login />} />
      <Route path="register" element={<Register />} />
      <Route path="access-denied" element={<AccessDenied />} />
      <Route path="*" element={<NotFound />} />
    </>
  );
};
