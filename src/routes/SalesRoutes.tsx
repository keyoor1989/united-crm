
import React from "react";
import { Route } from "react-router-dom";
import TaskEnabledLayout from "@/components/layout/TaskEnabledLayout";
import Quotations from "@/pages/sales/Quotations";
import QuotationForm from "@/pages/sales/QuotationForm";
import PurchaseOrders from "@/pages/sales/PurchaseOrders";
import PurchaseOrderForm from "@/pages/sales/PurchaseOrderForm";
import SentOrders from "@/pages/sales/SentOrders";
import SentQuotations from "@/pages/sales/SentQuotations";
import OrderHistory from "@/pages/sales/OrderHistory";
import QuotationProducts from "@/pages/sales/QuotationProducts";
import ProductCatalog from "@/pages/sales/ProductCatalog";
import ContractUpload from "@/pages/sales/ContractUpload";

export const SalesRoutes = () => {
  return (
    <>
      <Route
        path="quotations"
        element={
          <TaskEnabledLayout>
            <Quotations />
          </TaskEnabledLayout>
        }
      />
      <Route
        path="quotation-form"
        element={
          <TaskEnabledLayout>
            <QuotationForm />
          </TaskEnabledLayout>
        }
      />
      <Route
        path="purchase-orders"
        element={
          <TaskEnabledLayout>
            <PurchaseOrders />
          </TaskEnabledLayout>
        }
      />
      <Route
        path="purchase-order-form"
        element={
          <TaskEnabledLayout>
            <PurchaseOrderForm />
          </TaskEnabledLayout>
        }
      />
      <Route
        path="sent-orders"
        element={
          <TaskEnabledLayout>
            <SentOrders />
          </TaskEnabledLayout>
        }
      />
      <Route
        path="sent-quotations"
        element={
          <TaskEnabledLayout>
            <SentQuotations />
          </TaskEnabledLayout>
        }
      />
      <Route
        path="order-history"
        element={
          <TaskEnabledLayout>
            <OrderHistory />
          </TaskEnabledLayout>
        }
      />
      <Route
        path="quotation-products"
        element={
          <TaskEnabledLayout>
            <QuotationProducts />
          </TaskEnabledLayout>
        }
      />
      <Route
        path="product-catalog"
        element={
          <TaskEnabledLayout>
            <ProductCatalog />
          </TaskEnabledLayout>
        }
      />
      <Route
        path="contract-upload"
        element={
          <TaskEnabledLayout>
            <ContractUpload />
          </TaskEnabledLayout>
        }
      />
    </>
  );
};
