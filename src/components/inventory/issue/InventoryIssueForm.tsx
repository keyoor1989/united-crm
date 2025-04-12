
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { User } from "lucide-react";

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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Brand, InventoryItem, Model } from "@/types/inventory";

// Form schema
const formSchema = z.object({
  issueType: z.string().min(1, "Issue type is required"),
  engineerId: z.string().min(1, "Engineer is required"),
  brandId: z.string().optional(),
  modelId: z.string().optional(),
  itemId: z.string().min(1, "Item is required"),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  barcode: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const InventoryIssueForm = () => {
  const { toast } = useToast();
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  
  // Form setup
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      issueType: "Engineer",
      engineerId: "",
      brandId: "",
      modelId: "",
      itemId: "",
      quantity: 1,
      barcode: "",
    },
  });

  // Fetch engineers
  const { data: engineers = [], isLoading: isLoadingEngineers } = useQuery({
    queryKey: ['engineers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('engineers')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch brands
  const { data: brands = [], isLoading: isLoadingBrands } = useQuery({
    queryKey: ['brands'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory_brands')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as Brand[];
    },
  });

  // Fetch models based on selected brand
  const { data: models = [], isLoading: isLoadingModels } = useQuery({
    queryKey: ['models', selectedBrand],
    queryFn: async () => {
      let query = supabase
        .from('inventory_models')
        .select('*');
      
      if (selectedBrand) {
        query = query.eq('brand_id', selectedBrand);
      }
      
      const { data, error } = await query.order('name');
      
      if (error) throw error;
      return data as Model[];
    },
    enabled: !!selectedBrand,
  });

  // Fetch inventory items based on selected model
  const { data: items = [], isLoading: isLoadingItems } = useQuery({
    queryKey: ['items', selectedModel],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('opening_stock_entries')
        .select('*')
        .order('part_name');
      
      if (error) throw error;
      
      // Transform to InventoryItem type
      return data.map(item => ({
        id: item.id,
        modelId: "",  // Will be filtered based on model selection
        brandId: "",  // Will be filtered based on brand selection
        name: item.part_name,
        type: item.category,
        minQuantity: item.min_stock,
        currentQuantity: item.quantity,
        lastPurchasePrice: item.purchase_price,
        lastVendor: "",
        barcode: item.part_number || "",
        createdAt: item.created_at
      })) as InventoryItem[];
    },
  });

  // Handle brand change
  const handleBrandChange = (brandId: string) => {
    setSelectedBrand(brandId);
    setSelectedModel(null);
    form.setValue("brandId", brandId);
    form.setValue("modelId", "");
    form.setValue("itemId", "");
  };

  // Handle model change
  const handleModelChange = (modelId: string) => {
    setSelectedModel(modelId);
    form.setValue("modelId", modelId);
    form.setValue("itemId", "");
  };

  // Filter items based on selected model or show all if no model selected
  const filteredItems = selectedModel
    ? items.filter(item => item.modelId === selectedModel)
    : items;

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    try {
      const selectedEngineer = engineers.find(e => e.id === values.engineerId);
      const selectedItem = items.find(i => i.id === values.itemId);
      
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
        item_id: values.itemId,
        item_name: selectedItem.name,
        quantity: values.quantity,
        issue_date: new Date().toISOString(),
      };
      
      // Insert into database
      const { error } = await supabase
        .from('engineer_inventory')
        .insert(issueData);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: `${values.quantity} ${selectedItem.name} issued to ${selectedEngineer.name}`,
      });
      
      // Reset form
      form.reset({
        issueType: "Engineer",
        engineerId: "",
        brandId: "",
        modelId: "",
        itemId: "",
        quantity: 1,
        barcode: "",
      });
      setSelectedBrand(null);
      setSelectedModel(null);
      
    } catch (error) {
      console.error("Error issuing item:", error);
      toast({
        title: "Error",
        description: "Failed to issue item. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle barcode scan
  const handleScan = () => {
    const barcode = form.getValues("barcode");
    if (!barcode) return;
    
    const item = items.find(i => i.barcode === barcode);
    if (item) {
      // If item found by barcode, auto-select it
      form.setValue("itemId", item.id);
      toast({
        title: "Item Found",
        description: `${item.name} selected by barcode`,
      });
    } else {
      toast({
        title: "Not Found",
        description: "No item found with this barcode",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Issue Type */}
              <FormField
                control={form.control}
                name="issueType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Issue Type</FormLabel>
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
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Engineer Selection */}
              <FormField
                control={form.control}
                name="engineerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Engineer Name</FormLabel>
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
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <h3 className="text-lg font-medium">Item Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Brand Selection */}
              <FormField
                control={form.control}
                name="brandId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand</FormLabel>
                    <Select
                      onValueChange={(value) => handleBrandChange(value)}
                      value={selectedBrand || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Brand" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {brands.map((brand) => (
                          <SelectItem key={brand.id} value={brand.id}>
                            {brand.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Model Selection */}
              <FormField
                control={form.control}
                name="modelId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Model</FormLabel>
                    <Select
                      onValueChange={(value) => handleModelChange(value)}
                      value={selectedModel || ""}
                      disabled={!selectedBrand}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={selectedBrand ? "Select Model" : "Select Brand first"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {models.map((model) => (
                          <SelectItem key={model.id} value={model.id}>
                            {model.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Item Selection */}
              <FormField
                control={form.control}
                name="itemId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Item</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={selectedModel ? "Select Item" : "Select Model first"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {filteredItems.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.name} ({item.currentQuantity} in stock)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Barcode Scanner */}
            <FormField
              control={form.control}
              name="barcode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Scan Barcode</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter or scan barcode"
                        className="flex-1"
                      />
                    </FormControl>
                    <Button type="button" onClick={handleScan} className="w-24">
                      Scan
                    </Button>
                  </div>
                  <FormMessage />
                  <p className="text-sm text-muted-foreground mt-1">
                    If barcode scanner is not available, you can use the selection above.
                  </p>
                </FormItem>
              )}
            />

            {/* Quantity */}
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
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline">
                Cancel
              </Button>
              <Button type="submit">
                Issue Item
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default InventoryIssueForm;
