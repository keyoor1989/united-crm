
import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from 'date-fns';

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { notifyFollowUp } from "@/services/telegramService";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Define a schema with the correct follow-up types that match the database constraint
const formSchema = z.object({
  date: z.date({
    required_error: "A date is required.",
  }),
  type: z.enum(["quotation", "demo", "negotiation", "closure"], {
    required_error: "Please select a follow-up type.",
  }),
  notes: z.string().optional(),
});

interface SalesFollowUpDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  customerId: string;
  customerName: string;
  location: string;
  phone: string;
  onSave?: (data: any) => void;
}

const SalesFollowUpDialog: React.FC<SalesFollowUpDialogProps> = ({ 
  open, 
  setOpen, 
  customerId, 
  customerName,
  location,
  phone,
  onSave
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date(),
      type: undefined,
      notes: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // Reset error state
    setError(null);
    setIsLoading(true);
    
    try {
      // Validate required customer data
      if (!customerId || !customerName) {
        throw new Error("Customer information is missing. Please ensure the customer is properly selected.");
      }
      
      const followUpData = {
        customer_id: customerId,
        customer_name: customerName,
        date: new Date(values.date).toISOString(),
        type: values.type,
        notes: values.notes,
        location: location || "",
        contact_phone: phone || "",
        status: "pending"
      };
      
      console.log("Submitting follow-up data:", followUpData);
      
      const { data, error } = await supabase
        .from("sales_followups")
        .insert(followUpData)
        .select()
        .single();
      
      if (error) throw error;
      
      // Send notification via Telegram
      await notifyFollowUp(followUpData);
      
      toast({
        title: "Success",
        description: "Follow-up scheduled successfully"
      });
      
      onSave?.(data);
      setOpen(false);
    } catch (error: any) {
      console.error("Error creating follow-up:", error);
      setError(error.message || "Failed to schedule follow-up");
      toast({
        title: "Error",
        description: error.message || "Failed to schedule follow-up",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn(open ? "block" : "hidden", "fixed inset-0 z-50 overflow-auto bg-black/50")}>
      <div className="relative m-auto h-fit w-full max-w-2xl p-6">
        <div className="rounded-lg bg-white p-4">
          <h2 className="text-lg font-medium">Schedule Follow-up</h2>
          
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {!customerId && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Warning</AlertTitle>
              <AlertDescription>
                Customer data is missing. Please ensure you've selected a valid customer.
              </AlertDescription>
            </Alert>
          )}
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-[240px] pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date(new Date().setHours(0, 0, 0, 0))
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger className="w-[240px]">
                          <SelectValue placeholder="Select a type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="quotation">Quotation</SelectItem>
                          <SelectItem value="demo">Demo</SelectItem>
                          <SelectItem value="negotiation">Negotiation</SelectItem>
                          <SelectItem value="closure">Closure</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormDescription>
                      What type of follow-up is this?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Add any notes about this follow-up." className="resize-none" {...field} />
                    </FormControl>
                    <FormDescription>
                      Add any notes about this follow-up.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end">
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading || !customerId}>
                  {isLoading ? "Loading..." : "Save"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default SalesFollowUpDialog;
