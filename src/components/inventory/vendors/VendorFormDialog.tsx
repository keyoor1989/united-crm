
import React, { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Vendor } from "@/types/inventory";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";

const formSchema = z.object({
  name: z.string().min(2, { message: "Vendor name must be at least 2 characters." }),
  gstNo: z.string().optional(),
  phone: z.string().min(10, { message: "Phone number must be at least 10 characters." }),
  email: z.string().email({ message: "Invalid email address." }).optional().or(z.string().length(0)),
  address: z.string().min(3, { message: "Address must be at least 3 characters." }),
  contactPerson: z.string().optional(),
});

type VendorFormValues = z.infer<typeof formSchema>;

interface VendorFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedVendor: Vendor | null;
  onSave: (data: VendorFormValues) => Promise<void>;
}

const VendorFormDialog: React.FC<VendorFormDialogProps> = ({
  open,
  onOpenChange,
  selectedVendor,
  onSave,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<VendorFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: selectedVendor?.name || "",
      gstNo: selectedVendor?.gstNo || "",
      phone: selectedVendor?.phone || "",
      email: selectedVendor?.email || "",
      address: selectedVendor?.address || "",
      contactPerson: selectedVendor?.contactPerson || "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: selectedVendor?.name || "",
        gstNo: selectedVendor?.gstNo || "",
        phone: selectedVendor?.phone || "",
        email: selectedVendor?.email || "",
        address: selectedVendor?.address || "",
        contactPerson: selectedVendor?.contactPerson || "",
      });
    }
  }, [selectedVendor, form, open]);

  // Handle dialog close - prevent closing if form is submitting
  const handleOpenChange = (newOpen: boolean) => {
    if (!isSubmitting) {
      onOpenChange(newOpen);
    }
  };

  async function onSubmit(data: VendorFormValues) {
    setIsSubmitting(true);
    try {
      await onSave(data);
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving vendor:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{selectedVendor ? "Edit Vendor" : "Add New Vendor"}</DialogTitle>
          <DialogDescription>
            {selectedVendor ? 
              "Update vendor details below." : 
              "Enter the vendor details to add them to your directory."
            }
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor="name" className="text-right">
                    Vendor Name*
                  </Label>
                  <FormControl>
                    <Input
                      id="name"
                      placeholder="Enter vendor name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="gstNo"
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor="gstNo" className="text-right">
                    GST Number
                  </Label>
                  <FormControl>
                    <Input
                      id="gstNo"
                      placeholder="Enter GST number (optional)"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor="phone" className="text-right">
                    Phone Number*
                  </Label>
                  <FormControl>
                    <Input
                      id="phone"
                      placeholder="Enter phone number"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor="email" className="text-right">
                    Email Address
                  </Label>
                  <FormControl>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter email address"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor="address" className="text-right">
                    Address*
                  </Label>
                  <FormControl>
                    <Input
                      id="address"
                      placeholder="Enter complete address"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="contactPerson"
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor="contactPerson" className="text-right">
                    Contact Person
                  </Label>
                  <FormControl>
                    <Input
                      id="contactPerson"
                      placeholder="Enter contact person"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : selectedVendor ? "Update Vendor" : "Add Vendor"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default VendorFormDialog;
