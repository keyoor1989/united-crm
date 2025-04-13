
import React from "react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UseFormReturn } from "react-hook-form";
import { ServiceCallFormData } from "@/hooks/useServiceCallForm";
import { CustomerType } from "@/types/customer";
import { Clock } from "lucide-react";
import CustomerSearch from "@/components/chat/quotation/CustomerSearch";

interface CustomerSectionProps {
  form: UseFormReturn<ServiceCallFormData>;
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
          <div className="col-span-2">
            <CustomerSearch
              onSelectCustomer={handleCustomerSelect}
              showSearch={showCustomerSearch}
              onToggleSearch={() => setShowCustomerSearch(!showCustomerSearch)}
              customerName={selectedCustomer?.name || ""}
            />
          </div>

          <FormField
            control={form.control}
            name="customer.phone"
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
            name="customer.location"
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
