
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useCustomerForm } from "../CustomerFormContext";
import { MessageSquare } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const NotesForm = () => {
  const { form } = useCustomerForm();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Notes</h3>
      <Separator />
      
      <FormField
        control={form.control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Additional Notes</FormLabel>
            <FormControl>
              <div className="relative">
                <MessageSquare className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Textarea 
                  placeholder="Add any additional notes here"
                  className="min-h-[120px] pl-8 pt-8"
                  {...field}
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default NotesForm;
