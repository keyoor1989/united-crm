
import React from "react";
import BillingReportView from "@/components/service/BillingReportView";
import { useServiceData } from "@/hooks/useServiceData";

const ServiceBilling = () => {
  const { allCalls, isLoading } = useServiceData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Service Billing Management</h1>
        <p className="text-muted-foreground">
          Track service charges, parts usage, and financial reconciliation
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <p>Loading billing data...</p>
        </div>
      ) : (
        <BillingReportView serviceCalls={allCalls} />
      )}
    </div>
  );
};

export default ServiceBilling;
