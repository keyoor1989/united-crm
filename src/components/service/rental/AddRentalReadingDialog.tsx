
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { RentalMachine } from "@/types/finance";

const formSchema = z.object({
  a4Reading: z.string().min(1, "A4 reading is required"),
  a3Reading: z.string(),
  date: z.string().min(1, "Date is required"),
});

type FormValues = z.infer<typeof formSchema>;

interface AddRentalReadingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  machineData: RentalMachine | null;
  onReadingAdded: () => void;
}

const AddRentalReadingDialog: React.FC<AddRentalReadingDialogProps> = ({
  open,
  onOpenChange,
  machineData,
  onReadingAdded,
}) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      a4Reading: machineData?.currentA4Reading?.toString() || "0",
      a3Reading: machineData?.currentA3Reading?.toString() || "0",
      date: new Date().toISOString().split('T')[0],
    },
  });

  React.useEffect(() => {
    if (machineData && open) {
      form.setValue("a4Reading", machineData.currentA4Reading?.toString() || "0");
      form.setValue("a3Reading", machineData.currentA3Reading?.toString() || "0");
    }
  }, [machineData, open, form]);

  const onSubmit = async (values: FormValues) => {
    if (!machineData) {
      toast.error("Machine data not available");
      return;
    }

    try {
      const a4Reading = parseInt(values.a4Reading);
      const a3Reading = values.a3Reading ? parseInt(values.a3Reading) : 0;
      const formattedDate = values.date;

      // Update machine readings
      const { error } = await supabase
        .from('amc_machines')
        .update({
          last_a4_reading: a4Reading,
          last_a3_reading: a3Reading,
          last_reading_date: formattedDate
        })
        .eq('id', machineData.id);

      if (error) throw error;

      toast.success("Reading updated successfully");
      onReadingAdded();
      onOpenChange(false);
    } catch (err) {
      console.error("Error updating reading:", err);
      toast.error("Failed to update reading");
    }
  };

  if (!machineData) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Reading</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <p className="text-sm mb-4">
                <span className="font-semibold">Machine:</span> {machineData.model} ({machineData.serialNumber})
              </p>
            </div>

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reading Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="a4Reading"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>A4 Reading</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="a3Reading"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>A3 Reading</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit">Save Reading</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddRentalReadingDialog;
