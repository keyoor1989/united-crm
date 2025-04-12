
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { CustomerType } from "@/types/customer";
import CustomerSearch from "@/components/chat/quotation/CustomerSearch";
import { UseFormReturn } from "react-hook-form";
import { ServiceCallFormValues } from "@/hooks/useServiceCallForm";

interface CustomerSectionProps {
  form: UseFormReturn<ServiceCallFormValues>;
  selectedCustomer: CustomerType | null;
  showCustomerSearch: boolean;
  slaTime: number | null;
  setShowCustomerSearch: (show: boolean) => void;
  handleCustomerSelect: (customer: CustomerType) => void;
}

const CustomerSection: React.FC<CustomerSectionProps> = ({
  form,
  selectedCustomer,
  showCustomerSearch,
  slaTime,
  setShowCustomerSearch,
  handleCustomerSelect,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Information</CardTitle>
        <CardDescription>
          Select a customer to automatically fill in their details
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CustomerSearch
            onSelectCustomer={handleCustomerSelect}
            showSearch={showCustomerSearch}
            onToggleSearch={() => setShowCustomerSearch(!showCustomerSearch)}
            customerName={selectedCustomer?.name || ""}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input {...field} readOnly={!!selectedCustomer} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input {...field} readOnly={!!selectedCustomer} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {selectedCustomer && (
            <div className="flex items-center gap-2 p-2 bg-brand-50 rounded-md border border-brand-100">
              <Clock className="h-5 w-5 text-brand-600" />
              <span>
                SLA Response Time: <strong>{slaTime} hours</strong>
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerSection;
