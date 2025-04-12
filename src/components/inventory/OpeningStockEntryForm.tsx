
import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
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

// Define the form schema
const formSchema = z.object({
  brand: z.string().min(1, { message: "Brand is required" }),
  model: z.string().min(1, { message: "Model is required" }),
  partName: z.string().min(1, { message: "Part name is required" }),
  partNumber: z.string().optional(),
  category: z.string().min(1, { message: "Category is required" }),
  quantity: z.coerce.number().int().min(1, { message: "Quantity must be at least 1" }),
  purchasePrice: z.coerce.number().min(1, { message: "Purchase price is required" }),
  minStock: z.coerce.number().int().min(0).default(5),
});

type FormValues = z.infer<typeof formSchema>;

interface OpeningStockEntryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddPart: (part: any) => void;
}

// Sample data for dropdowns
const brands = ["Kyocera", "Canon", "HP", "Konica Minolta", "Ricoh", "Sharp"];
const categories = ["Toner", "Drum", "Maintenance Kit", "Fuser", "Developer", "Other"];

// Models by brand - in a real app this would come from an API or database
const modelsByBrand: Record<string, string[]> = {
  "Kyocera": ["ECOSYS M2040dn", "ECOSYS M2540dn", "ECOSYS M2640idw", "TASKalfa 2554ci"],
  "Canon": ["IR 2002", "IR 2004", "IR 2006", "IR ADV 4025"],
  "HP": ["LaserJet Pro M402", "LaserJet Pro M426", "LaserJet Enterprise M507"],
  "Konica Minolta": ["Bizhub C224e", "Bizhub C284e", "Bizhub 367"],
  "Ricoh": ["MP 2014", "MP 301", "Aficio MP 2501L"],
  "Sharp": ["AR-6020", "MX-M264N", "MX-3050N"],
};

const OpeningStockEntryForm = ({ open, onOpenChange, onAddPart }: OpeningStockEntryFormProps) => {
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      brand: "",
      model: "",
      partName: "",
      partNumber: "",
      category: "",
      quantity: 1,
      purchasePrice: 0,
      minStock: 5,
    },
  });

  const handleSubmit = (values: FormValues) => {
    // Create a new part entry with form values
    const newPart = {
      id: `MP${Math.floor(Math.random() * 10000).toString().padStart(3, '0')}`,
      partNumber: values.partNumber || `${values.brand.substring(0, 2)}-${Math.floor(Math.random() * 10000)}`,
      name: values.partName,
      brand: values.brand,
      compatibleModels: [values.model],
      category: values.category,
      currentStock: values.quantity,
      minStock: values.minStock,
      purchasePrice: values.purchasePrice,
    };

    // Add the part to the catalog
    onAddPart(newPart);
    
    // Show success message
    toast.success("Opening stock entry added successfully!");
    
    // Reset form and close dialog
    form.reset();
    onOpenChange(false);
  };

  // Handle brand change to update model options
  const handleBrandChange = (value: string) => {
    setSelectedBrand(value);
    form.setValue("brand", value);
    form.setValue("model", "");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Add Opening Stock Entry</DialogTitle>
          <DialogDescription>
            Enter the part details and inventory information for your opening stock.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand</FormLabel>
                    <Select 
                      onValueChange={(value) => handleBrandChange(value)} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select brand" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {brands.map((brand) => (
                          <SelectItem key={brand} value={brand}>
                            {brand}
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
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Compatible Model</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      disabled={!selectedBrand}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select model" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {selectedBrand && modelsByBrand[selectedBrand]?.map((model) => (
                          <SelectItem key={model} value={model}>
                            {model}
                          </SelectItem>
                        ))}
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
                name="partName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Part Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Drum Unit" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="partNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Part Number (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. DK-1150" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
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
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
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
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Opening Quantity</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="purchasePrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purchase Price (₹)</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="minStock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Stock Level</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">Add Opening Stock</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default OpeningStockEntryForm;
