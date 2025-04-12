
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { User, Search, Box } from "lucide-react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
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
import { useWarehouses } from "@/hooks/warehouses/useWarehouses";

// Form schema
const formSchema = z.object({
  issueType: z.string().min(1, "Issue type is required"),
  engineerId: z.string().min(1, "Engineer is required"),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1").default(1),
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
  brand?: string;
}

const InventoryIssueForm = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("");
  
  const { warehouses, isLoadingWarehouses } = useWarehouses();
  
  // Form setup
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      issueType: "Engineer",
      engineerId: "",
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

  // Fetch inventory items
  const { data: items = [], isLoading: isLoadingItems } = useQuery({
    queryKey: ['inventory_items', selectedWarehouse],
    queryFn: async () => {
      let query = supabase
        .from('opening_stock_entries')
        .select('id, part_name, category, quantity, min_stock, purchase_price, brand')
        .order('part_name');
      
      if (selectedWarehouse) {
        query = query.eq('warehouse_id', selectedWarehouse);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as InventoryItem[];
    },
  });

  // Extract unique brands from items
  const brands = React.useMemo(() => {
    const brandSet = new Set<string>();
    items.forEach(item => {
      if (item.brand) {
        brandSet.add(item.brand);
      }
    });
    return Array.from(brandSet).sort();
  }, [items]);

  // Get categories (models) based on selected brand
  const models = React.useMemo(() => {
    const modelSet = new Set<string>();
    items.forEach(item => {
      if ((!selectedBrand || item.brand === selectedBrand) && item.category) {
        modelSet.add(item.category);
      }
    });
    return Array.from(modelSet).sort();
  }, [items, selectedBrand]);

  // Filter items based on search term, brand and model
  const filteredItems = items.filter(item => {
    const matchesSearch = searchTerm 
      ? item.part_name.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    
    const matchesBrand = selectedBrand 
      ? item.brand === selectedBrand 
      : true;
    
    const matchesModel = selectedModel 
      ? item.category === selectedModel 
      : true;
    
    return matchesSearch && matchesBrand && matchesModel;
  });

  // Handle selecting an item from the table
  const handleSelectItem = (itemId: string) => {
    setSelectedItemId(itemId);
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
        warehouse_id: selectedWarehouse,
        warehouse_source: selectedWarehouse 
          ? warehouses.find(w => w.id === selectedWarehouse)?.name 
          : null
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
        quantity: 1,
      });
      setSelectedItemId(null);
      setSearchTerm("");
      setSelectedBrand("");
      setSelectedModel("");
      
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="p-6">
        {/* Warehouse Selection */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">Select Warehouse</h3>
          <div className="flex gap-2">
            <Button 
              type="button"
              variant="outline"
              className={`rounded-md py-2 px-6 ${!selectedWarehouse ? 'bg-black text-white hover:bg-black hover:text-white' : ''}`}
              onClick={() => setSelectedWarehouse(null)}
            >
              All Warehouses
            </Button>
            {warehouses.map(warehouse => (
              <Button
                key={warehouse.id}
                type="button"
                variant="outline"
                className={`rounded-md py-2 px-6 ${selectedWarehouse === warehouse.id ? 'bg-black text-white hover:bg-black hover:text-white' : ''}`}
                onClick={() => setSelectedWarehouse(warehouse.id)}
              >
                {warehouse.name} ({warehouse.location})
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-8">
          {/* Issue Type */}
          <div>
            <label className="block text-sm font-medium mb-2">Issue Type</label>
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
                      <SelectTrigger className="w-full h-11 rounded-md">
                        <User className="h-4 w-4 mr-2 text-gray-500" />
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
            <label className="block text-sm font-medium mb-2">Engineer Name</label>
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
                      <SelectTrigger className="w-full h-11 rounded-md">
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

        <div className="border-t pt-6">
          <h3 className="text-lg font-medium mb-4">Item Details</h3>
          
          <div className="grid grid-cols-3 gap-4 mb-4">
            {/* Search */}
            <div>
              <div className="relative">
                <Search className="h-4 w-4 absolute top-3 left-3 text-gray-500" />
                <Input 
                  placeholder="Search items..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-11 rounded-md"
                />
              </div>
            </div>
            
            {/* Brand Selection */}
            <div>
              <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                <SelectTrigger className="h-11 rounded-md">
                  <SelectValue placeholder="Select Brand" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Brands</SelectItem>
                  {brands.map(brand => (
                    <SelectItem key={brand} value={brand}>
                      {brand}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Model Selection */}
            <div>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="h-11 rounded-md">
                  <SelectValue placeholder="Select Model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Models</SelectItem>
                  {models.map(model => (
                    <SelectItem key={model} value={model}>
                      {model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Items Table */}
          <div className="border rounded-md overflow-hidden mb-8">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">Select</TableHead>
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
                        <div className="flex justify-center">
                          <input
                            type="radio"
                            name="selectedItem"
                            checked={selectedItemId === item.id}
                            onChange={() => handleSelectItem(item.id)}
                            className="h-4 w-4 rounded-full border-gray-300"
                          />
                        </div>
                      </TableCell>
                      <TableCell>{item.part_name}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>
                        <span className={item.quantity < item.min_stock ? "text-destructive" : "text-green-600"}>
                          {item.quantity}
                        </span>{" "}
                        <span className="text-muted-foreground">
                          (Min: {item.min_stock})
                        </span>
                      </TableCell>
                      <TableCell>₹{item.purchase_price}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">
                      No items found. Try adjusting your search or filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="flex justify-center">
          <Button 
            type="submit" 
            className="w-full max-w-xs bg-indigo-600 hover:bg-indigo-700"
            disabled={!selectedItemId}
          >
            <Box className="mr-2 h-5 w-5" />
            Issue Item
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default InventoryIssueForm;
