
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "./types";
import { useTaskContext } from "@/contexts/TaskContext";
import { useAuth } from "@/contexts/AuthContext";

interface AssignmentFieldsProps {
  form: UseFormReturn<FormValues>;
}

const AssignmentFields: React.FC<AssignmentFieldsProps> = ({ form }) => {
  const { users } = useTaskContext();
  const { user } = useAuth();
  
  console.log("AssignmentFields - Available users:", users); // Debug log
  
  return (
    <div className="grid grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="assignedTo"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Assigned To</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value || (user ? user.id : "not-assigned")}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {/* First show the current user */}
                {user && (
                  <SelectItem key={user.id} value={user.id || "current-user"}>
                    {user.name || user.email} (Me)
                  </SelectItem>
                )}
                {/* Then show other users */}
                {users
                  .filter(u => !user || u.id !== user.id)
                  .map(u => (
                    <SelectItem key={u.id} value={u.id || `user-${u.name}`}>
                      {u.name} ({u.department})
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
            <Select onValueChange={field.onChange} defaultValue={field.value || "Sales"}>
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
