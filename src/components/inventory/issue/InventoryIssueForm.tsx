
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import WarehouseSelector from "./WarehouseSelector";
import IssueTypeSelection from "./IssueTypeSelection";
import ItemFilters from "./ItemFilters";
import ItemsTable from "./ItemsTable";
import IssueButton from "./IssueButton";

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
          ? (await supabase.from('warehouses').select('name').eq('id', selectedWarehouse).single()).data?.name
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
        <WarehouseSelector 
          selectedWarehouse={selectedWarehouse}
          setSelectedWarehouse={setSelectedWarehouse}
        />

        {/* Issue Type and Engineer Selection */}
        <IssueTypeSelection 
          form={form}
          engineers={engineers}
          isLoadingEngineers={isLoadingEngineers}
        />

        <div className="border-t pt-6">
          <h3 className="text-lg font-medium mb-4">Item Details</h3>
          
          {/* Search and Filter Controls */}
          <ItemFilters 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedBrand={selectedBrand}
            setSelectedBrand={setSelectedBrand}
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
            brands={brands}
            models={models}
          />

          {/* Items Table */}
          <ItemsTable 
            filteredItems={filteredItems}
            selectedItemId={selectedItemId}
            handleSelectItem={handleSelectItem}
          />
        </div>

        {/* Issue Button */}
        <IssueButton selectedItemId={selectedItemId} />
      </form>
    </Form>
  );
};

export default InventoryIssueForm;
