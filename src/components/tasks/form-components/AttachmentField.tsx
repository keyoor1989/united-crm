
import React from "react";
import { Paperclip } from "lucide-react";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "./types";

interface AttachmentFieldProps {
  form: UseFormReturn<FormValues>;
}

const AttachmentField: React.FC<AttachmentFieldProps> = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="attachments"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Attachments</FormLabel>
          <FormControl>
            <div className="border border-input rounded-md p-2 flex items-center cursor-not-allowed opacity-50">
              <Paperclip className="h-4 w-4 mr-2" />
              <span className="text-muted-foreground text-sm">
                Attach files (Coming soon)
              </span>
            </div>
          </FormControl>
          <FormDescription>
            Upload relevant documents (PDF, DOCX, JPG)
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default AttachmentField;
