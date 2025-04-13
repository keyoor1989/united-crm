
import React from "react";
import { Form } from "@/components/ui/form";
import { useServiceCallForm } from "@/hooks/useServiceCallForm";
import CustomerSection from "@/components/service/form/CustomerSection";
import MachineSection from "@/components/service/form/MachineSection";
import IssueSection from "@/components/service/form/IssueSection";

const ServiceCallForm = () => {
  const {
    form,
    isSubmitting,
    selectedCustomer,
    customerMachines,
    slaTime,
    showCustomerSearch,
    assignEngineerNow,
    engineers,
    handleCustomerSelect,
    handleMachineChange,
    autoAssignEngineer,
    setShowCustomerSearch,
    setAssignEngineerNow,
    onSubmit
  } = useServiceCallForm();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Create Service Call</h1>
        <p className="text-muted-foreground">
          Create a new service call for customer support
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <CustomerSection
            form={form}
            selectedCustomer={selectedCustomer}
            showCustomerSearch={showCustomerSearch}
            slaTime={slaTime || 0}
            setShowCustomerSearch={setShowCustomerSearch}
            handleCustomerSelect={handleCustomerSelect}
          />

          <MachineSection
            form={form}
            customerMachines={customerMachines || []}
            selectedCustomer={selectedCustomer}
            handleMachineChange={handleMachineChange}
          />

          <IssueSection
            form={form}
            isSubmitting={isSubmitting}
            selectedCustomer={selectedCustomer}
            engineers={engineers || []}
            assignEngineerNow={assignEngineerNow}
            setAssignEngineerNow={setAssignEngineerNow}
            autoAssignEngineer={autoAssignEngineer}
            onSubmit={onSubmit}
          />
        </form>
      </Form>
    </div>
  );
};

export default ServiceCallForm;
