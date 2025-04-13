
import React from "react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UseFormReturn } from "react-hook-form";
import { ServiceCallFormData } from "@/hooks/useServiceCallForm";
import { CustomerType } from "@/types/customer";
import { Clock } from "lucide-react";

interface CustomerSectionProps {
  form: UseFormReturn<ServiceCallFormData>;
  selectedCustomer: CustomerType | null;
  showCustomerSearch: boolean;
  slaTime: number | null;
  setShowCustomerSearch: (show: boolean) => void;
  handleCustomerSelect: (customer: CustomerType) => void;
}

interface CustomerSearchProps {
  onSelectCustomer: (customer: CustomerType) => void;
  showSearch: boolean;
  onToggleSearch: () => void;
  customerName: string;
}

// Simple placeholder for CustomerSearch until the real component is available
const CustomerSearch: React.FC<CustomerSearchProps> = ({ 
  onSelectCustomer, 
  showSearch, 
  onToggleSearch, 
  customerName 
}) => {
  return (
    <div className="mb-4">
      <FormItem>
        <FormLabel>Customer</FormLabel>
        <div className="flex gap-2">
          <Input value={customerName} readOnly placeholder="Search or select a customer" />
          <Button type="button" onClick={onToggleSearch}>
            {showSearch ? "Cancel" : "Search"}
          </Button>
        </div>
      </FormItem>
    </div>
  );
};

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
