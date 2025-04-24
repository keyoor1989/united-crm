
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useRentalMachineForm } from "@/hooks/rental/useRentalMachineForm";
import { BasicDetailsSection } from "./form-sections/BasicDetailsSection";
import { CopyLimitSection } from "./form-sections/CopyLimitSection";
import { InitialReadingsSection } from "./form-sections/InitialReadingsSection";

interface AddRentalMachineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMachineAdded: () => void;
}

const AddRentalMachineDialog: React.FC<AddRentalMachineDialogProps> = ({
  open,
  onOpenChange,
  onMachineAdded,
}) => {
  const { form, isSubmitting, onSubmit } = useRentalMachineForm(onMachineAdded);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Rental Machine</DialogTitle>
          <DialogDescription>Enter machine details including rental terms and initial readings</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <BasicDetailsSection form={form} />
            <CopyLimitSection form={form} />
            <InitialReadingsSection form={form} />
            
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Add Machine"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddRentalMachineDialog;
