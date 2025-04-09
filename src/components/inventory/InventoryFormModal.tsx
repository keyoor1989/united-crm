
import React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Define the form schema with Zod
const formSchema = z.object({
  name: z.string().min(3, { message: "Product name must be at least 3 characters" }),
  sku: z.string().min(2, { message: "SKU is required" }),
  category: z.string().min(1, { message: "Please select a category" }),
  quantity: z.coerce.number().int().min(0, { message: "Quantity must be 0 or higher" }),
  location: z.string().min(1, { message: "Please select a location" }),
  price: z.coerce.number().positive({ message: "Price must be greater than 0" }),
});

// Define the type based on the schema
type InventoryFormValues = z.infer<typeof formSchema>;

// Sample inventory item for editing (would come from props in real app)
const defaultValues: Partial<InventoryFormValues> = {
  name: "",
  sku: "",
  category: "",
  quantity: 0,
  location: "",
  price: 0,
};

type InventoryFormModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemToEdit?: {
    id: number;
    name: string;
    sku: string;
    category: string;
    quantity: number;
    location: string;
    price: number;
    status?: string;
  } | null;
};

const InventoryFormModal = ({ open, onOpenChange, itemToEdit }: InventoryFormModalProps) => {
  // Initialize form with either the item to edit or default values
  const form = useForm<InventoryFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: itemToEdit || defaultValues,
  });

  function onSubmit(values: InventoryFormValues) {
    // Determine if this is a create or update operation
    const action = itemToEdit ? "updated" : "added";
    
    // This would typically connect to an API or state management
    console.log(values);
    
    // Show success message
    toast.success(`Inventory item ${action} successfully!`);
    
    // Close the modal
    onOpenChange(false);
    
    // Reset the form
    form.reset();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{itemToEdit ? "Edit Inventory Item" : "Add New Inventory Item"}</DialogTitle>
          <DialogDescription>
            Fill in the details for this inventory item. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter product name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="sku"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SKU</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter SKU" {...field} />
                  </FormControl>
                  <FormDescription>
                    Unique product identifier
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Toner">Toner</SelectItem>
                        <SelectItem value="Drum">Drum</SelectItem>
                        <SelectItem value="Spare Parts">Spare Parts</SelectItem>
                        <SelectItem value="Machine">Machine</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Indore (HQ)">Indore (HQ)</SelectItem>
                        <SelectItem value="Bhopal Office">Bhopal Office</SelectItem>
                        <SelectItem value="Jabalpur Office">Jabalpur Office</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (₹)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit">{itemToEdit ? "Update Item" : "Add Item"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default InventoryFormModal;
