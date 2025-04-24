
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { RentalMachineFormValues } from "@/hooks/rental/useRentalMachineForm";

interface CopyLimitSectionProps {
  form: UseFormReturn<RentalMachineFormValues>;
}

export const CopyLimitSection: React.FC<CopyLimitSectionProps> = ({ form }) => {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="copyLimitA4"
          render={({ field }) => (
            <FormItem>
              <FormLabel>A4 Copy Limit</FormLabel>
              <FormControl>
                <Input type="number" placeholder="e.g. 5000" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="copyLimitA3"
          render={({ field }) => (
            <FormItem>
              <FormLabel>A3 Copy Limit</FormLabel>
              <FormControl>
                <Input type="number" placeholder="e.g. 1000" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="extraA4CopyCharge"
          render={({ field }) => (
            <FormItem>
              <FormLabel>A4 Per Copy Charge (₹)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="e.g. 0.50" step="0.01" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="extraA3CopyCharge"
          render={({ field }) => (
            <FormItem>
              <FormLabel>A3 Per Copy Charge (₹)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="e.g. 1.00" step="0.01" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  );
};
