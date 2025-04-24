
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { RentalMachineFormValues } from "@/hooks/rental/useRentalMachineForm";

interface InitialReadingsSectionProps {
  form: UseFormReturn<RentalMachineFormValues>;
}

export const InitialReadingsSection: React.FC<InitialReadingsSectionProps> = ({ form }) => {
  return (
    <div className="grid grid-cols-2 gap-4 border-t pt-4">
      <FormField
        control={form.control}
        name="initialA4Reading"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Initial A4 Reading</FormLabel>
            <FormControl>
              <Input type="number" placeholder="0" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="initialA3Reading"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Initial A3 Reading</FormLabel>
            <FormControl>
              <Input type="number" placeholder="0" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
