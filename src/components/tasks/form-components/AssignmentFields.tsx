
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { mockUsers } from "@/data/taskData";
import { FormValues } from "./types";

interface AssignmentFieldsProps {
  form: UseFormReturn<FormValues>;
}

const AssignmentFields: React.FC<AssignmentFieldsProps> = ({ form }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="assignedTo"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Assigned To</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {mockUsers.map(user => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name} ({user.department})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="department"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Department</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="Sales">Sales</SelectItem>
                <SelectItem value="Service">Service</SelectItem>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="Inventory">Inventory</SelectItem>
                <SelectItem value="Rental">Rental</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default AssignmentFields;
