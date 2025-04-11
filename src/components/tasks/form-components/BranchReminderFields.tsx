
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "./types";

interface BranchReminderFieldsProps {
  form: UseFormReturn<FormValues>;
}

const BranchReminderFields: React.FC<BranchReminderFieldsProps> = ({ form }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="branch"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Branch</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select branch" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="Indore">Indore</SelectItem>
                <SelectItem value="Bhopal">Bhopal</SelectItem>
                <SelectItem value="Jabalpur">Jabalpur</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="hasReminder"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between space-x-2 rounded-md border p-4">
            <div className="space-y-0.5">
              <FormLabel>Enable Reminder</FormLabel>
              <FormDescription>
                Reminder 2 hours before due time
              </FormDescription>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
};

export default BranchReminderFields;
