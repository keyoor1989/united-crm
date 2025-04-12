
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { User, Package, Search } from "lucide-react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from "@/components/ui/table";

// Form schema
const formSchema = z.object({
  issueType: z.string().min(1, "Issue type is required"),
  engineerId: z.string().min(1, "Engineer is required"),
  itemId: z.string().optional(),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
});

type FormValues = z.infer<typeof formSchema>;

interface Engineer {
  id: string;
  name: string;
}

interface InventoryItem {
  id: string;
  part_name: string;
  category: string;
  quantity: number;
  min_stock: number;
  purchase_price: number;
}

const InventoryIssueForm = () => {
  const { toast } = useToast();
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  
  // Form setup
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      issueType: "Engineer",
      engineerId: "",
      itemId: "",
      quantity: 1,
    },
  });

  // Fetch engineers
  const { data: engineers = [], isLoading: isLoadingEngineers } = useQuery({
    queryKey: ['engineers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('engineers')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      return data as Engineer[];
    },
  });

  // Fetch brands
  const { data: brands = [], isLoading: isLoadingBrands } = useQuery({
    queryKey: ['brands'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory_brands')
        .select('id, name');
      
      if (error) throw error;
      return data.map(brand => ({
        id: brand.id,
        name: brand.name,
      }));
    },
  });

  // Fetch models based on selected brand
  const { data: models = [], isLoading: isLoadingModels } = useQuery({
    queryKey: ['models', selectedBrand],
    queryFn: async () => {
      let query = supabase
        .from('inventory_models')
        .select('id, name, brand_id');
      
      if (selectedBrand) {
        query = query.eq('brand_id', selectedBrand);
      }
      
      const { data, error } = await query.order('name');
      
      if (error) throw error;
      return data.map(model => ({
        id: model.id,
        name: model.name,
        brandId: model.brand_id,
      }));
    },
    enabled: !!selectedBrand,
  });

  // Fetch inventory items
  const { data: items = [], isLoading: isLoadingItems } = useQuery({
    queryKey: ['items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('opening_stock_entries')
        .select('id, part_name, category, quantity, min_stock, purchase_price')
        .order('part_name');
      
      if (error) throw error;
      return data as InventoryItem[];
    },
  });

  // Handle brand change
  const handleBrandChange = (brandId: string) => {
    setSelectedBrand(brandId);
    setSelectedModel(null);
  };

  // Handle model change
  const handleModelChange = (modelId: string) => {
    setSelectedModel(modelId);
  };

  // Filter items based on search term, brand and model
  const filteredItems = items.filter(item => {
    const matchesSearch = item.part_name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Handle selecting an item from the table
  const handleSelectItem = (itemId: string) => {
    setSelectedItemId(itemId);
    form.setValue("itemId", itemId);
  };

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    try {
      if (!selectedItemId) {
        toast({
          title: "Error",
          description: "Please select an item to issue",
          variant: "destructive",
        });
        return;
      }

      const selectedEngineer = engineers.find(e => e.id === values.engineerId);
      const selectedItem = items.find(i => i.id === selectedItemId);
      
      if (!selectedEngineer || !selectedItem) {
        toast({
          title: "Error",
          description: "Engineer or item not found",
          variant: "destructive",
        });
        return;
      }
      
      // Prepare the data for insertion
      const issueData = {
        engineer_id: values.engineerId,
        engineer_name: selectedEngineer.name,
        item_id: selectedItemId,
        item_name: selectedItem.part_name,
        quantity: values.quantity,
        assigned_date: new Date().toISOString(),
      };
      
      // Insert into database
      const { error } = await supabase
        .from('engineer_inventory')
        .insert(issueData);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: `${values.quantity} ${selectedItem.part_name} issued to ${selectedEngineer.name}`,
      });
      
      // Reset form
      form.reset({
        issueType: "Engineer",
        engineerId: "",
        itemId: "",
        quantity: 1,
      });
      setSelectedBrand(null);
      setSelectedModel(null);
      setSelectedItemId(null);
      setSearchTerm("");
      
    } catch (error) {
      console.error("Error issuing item:", error);
      toast({
        title: "Error",
        description: "Failed to issue item. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Issue Type */}
          <div>
            <FormLabel>Issue Type</FormLabel>
            <FormField
              control={form.control}
              name="issueType"
              render={({ field }) => (
                <FormItem>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <User className="h-4 w-4 mr-2" />
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
            <FormLabel>Engineer Name</FormLabel>
            <FormField
              control={form.control}
              name="engineerId"
              render={({ field }) => (
                <FormItem>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
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

        <div className="border-t pt-4">
          <h3 className="text-lg font-medium mb-4">Item Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="relative">
              <Input 
                placeholder="Search items..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <Search className="h-4 w-4 absolute top-3 left-3 text-gray-500" />
            </div>
            
            <Select
              value={selectedBrand || ""}
              onValueChange={handleBrandChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Brand" />
              </SelectTrigger>
              <SelectContent>
                {brands.map((brand) => (
                  <SelectItem key={brand.id} value={brand.id}>
                    {brand.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedModel || ""}
              onValueChange={handleModelChange}
              disabled={!selectedBrand}
            >
              <SelectTrigger>
                <SelectValue placeholder={selectedBrand ? "Select Model" : "Select Brand first"} />
              </SelectTrigger>
              <SelectContent>
                {models.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    {model.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Items Table */}
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Select</TableHead>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.length > 0 ? (
                  filteredItems.map((item) => (
                    <TableRow key={item.id} className={selectedItemId === item.id ? "bg-muted" : ""}>
                      <TableCell>
                        <input
                          type="radio"
                          name="selectedItem"
                          checked={selectedItemId === item.id}
                          onChange={() => handleSelectItem(item.id)}
                          className="h-4 w-4 rounded-full border-gray-300"
                        />
                      </TableCell>
                      <TableCell>{item.part_name}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>
                        {item.quantity} (Min: {item.min_stock})
                      </TableCell>
                      <TableCell>₹{item.purchase_price}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">
                      No items found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Quantity */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantity</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-center mt-6">
          <Button 
            type="submit" 
            className="w-full md:w-auto"
            disabled={!selectedItemId}
          >
            <Package className="mr-2 h-5 w-5" />
            Issue Item
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default InventoryIssueForm;
