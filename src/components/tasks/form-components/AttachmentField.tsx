
import React, { useState } from "react";
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Paperclip, X } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "./types";

interface AttachmentFieldProps {
  form: UseFormReturn<FormValues>;
}

const AttachmentField: React.FC<AttachmentFieldProps> = ({ form }) => {
  const [attachmentUrl, setAttachmentUrl] = useState("");

  const handleAddAttachment = () => {
    if (!attachmentUrl.trim()) return;
    
    const currentAttachments = form.getValues("attachments") || [];
    form.setValue("attachments", [...currentAttachments, attachmentUrl]);
    setAttachmentUrl("");
  };

  const handleRemoveAttachment = (index: number) => {
    const currentAttachments = form.getValues("attachments") || [];
    const updatedAttachments = [...currentAttachments];
    updatedAttachments.splice(index, 1);
    form.setValue("attachments", updatedAttachments);
  };

  return (
    <FormField
      control={form.control}
      name="attachments"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Attachments</FormLabel>
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                type="url"
                placeholder="Add attachment URL"
                value={attachmentUrl}
                onChange={(e) => setAttachmentUrl(e.target.value)}
                className="flex-1"
              />
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleAddAttachment}
                size="icon"
              >
                <Paperclip className="h-4 w-4" />
              </Button>
            </div>
            
            {(field.value?.length || 0) > 0 && (
              <div className="space-y-1">
                {field.value?.map((url, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-2 border rounded-md"
                  >
                    <a 
                      href={url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-500 hover:underline truncate flex-1"
                    >
                      {url}
                    </a>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveAttachment(index)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default AttachmentField;
