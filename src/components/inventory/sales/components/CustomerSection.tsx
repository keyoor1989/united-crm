
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CustomerSearch from "@/components/chat/quotation/CustomerSearch";
import { CustomerType } from "@/types/customer";

interface CustomerSectionProps {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerLocation: string;
  customerType: string;
  selectedCustomer: CustomerType | null;
  showCustomerSearch: boolean;
  customerTypes: { value: string; label: string }[];
  onCustomerSelect: (customer: CustomerType) => void;
  onCustomerTypeChange: (value: string) => void;
  onToggleSearch: () => void;
}

export const CustomerSection: React.FC<CustomerSectionProps> = ({
  customerName,
  customerPhone,
  customerEmail,
  customerLocation,
  customerType,
  selectedCustomer,
  showCustomerSearch,
  customerTypes,
  onCustomerSelect,
  onCustomerTypeChange,
  onToggleSearch
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Customer Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <CustomerSearch 
          onSelectCustomer={onCustomerSelect}
          showSearch={showCustomerSearch}
          onToggleSearch={onToggleSearch}
          customerName={customerName}
        />
        
        {selectedCustomer && (
          <div className="text-sm space-y-1 border-l-2 border-primary/20 pl-2">
            {customerPhone && <p className="text-muted-foreground">Phone: {customerPhone}</p>}
            {customerEmail && <p className="text-muted-foreground">Email: {customerEmail}</p>}
            {customerLocation && <p className="text-muted-foreground">Location: {customerLocation}</p>}
          </div>
        )}
        
        <div>
          <Label htmlFor="customer-type">Customer Type</Label>
          <Select value={customerType} onValueChange={onCustomerTypeChange}>
            <SelectTrigger id="customer-type">
              <SelectValue placeholder="Select customer type" />
            </SelectTrigger>
            <SelectContent>
              {customerTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};
