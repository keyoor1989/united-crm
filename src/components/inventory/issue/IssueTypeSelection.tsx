
import React from "react";
import { FormField, FormItem, FormControl } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

interface Engineer {
  id: string;
  name: string;
}

interface IssueTypeSelectionProps {
  form: UseFormReturn<any>;
  engineers: Engineer[];
  isLoadingEngineers: boolean;
}

const IssueTypeSelection = ({ form, engineers, isLoadingEngineers }: IssueTypeSelectionProps) => {
  return (
    <div className="grid grid-cols-2 gap-6 mb-8">
      {/* Issue Type */}
      <div>
        <label className="block text-sm font-medium mb-2">Issue Type</label>
        <FormField
          control={form.control}
          name="issueType"
          render={({ field }) => (
            <FormItem>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value || "default_issue_type"}
              >
                <FormControl>
                  <SelectTrigger className="w-full h-11 rounded-md">
                    <User className="h-4 w-4 mr-2 text-gray-500" />
                    <SelectValue placeholder="Select issue type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Engineer">Engineer</SelectItem>
                  <SelectItem value="Customer">Customer</SelectItem>
                  <SelectItem value="Branch">Branch</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
      </div>

      {/* Engineer Selection */}
      <div>
        <label className="block text-sm font-medium mb-2">Engineer Name</label>
        <FormField
          control={form.control}
          name="engineerId"
          render={({ field }) => (
            <FormItem>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value || "select_engineer"}
              >
                <FormControl>
                  <SelectTrigger className="w-full h-11 rounded-md">
                    <SelectValue placeholder="Select engineer" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {engineers.map((engineer) => (
                    <SelectItem key={engineer.id} value={engineer.id}>
                      {engineer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default IssueTypeSelection;
