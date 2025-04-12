
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import WarehouseSelector from "./WarehouseSelector";
import IssueTypeSelection from "./IssueTypeSelection";
import ItemFilters from "./ItemFilters";
import ItemsTable from "./ItemsTable";
import IssueButton from "./IssueButton";
import { useEngineers } from "@/hooks/inventory/useEngineers";
import { useInventoryItems } from "@/hooks/inventory/useInventoryItems";
import { useFilteredItems } from "@/hooks/inventory/useFilteredItems";

// Form schema
const formSchema = z.object({
  issueType: z.string().min(1, "Issue type is required"),
  engineerId: z.string().min(1, "Engineer is required"),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1").default(1),
});

type FormValues = z.infer<typeof formSchema>;

const InventoryIssueForm = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string>("all_brands");
  const [selectedModel, setSelectedModel] = useState<string>("all_models");
  
  // Form setup
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      issueType: "Engineer",
      engineerId: "",
      quantity: 1,
    },
  });

  // Use custom hooks for data fetching
  const { engineers, isLoading: isLoadingEngineers } = useEngineers();
  const { items, isLoading: isLoadingItems } = useInventoryItems(selectedWarehouse);
  const { brands, models, filteredItems } = useFilteredItems(
    items,
    searchTerm,
    selectedBrand,
    selectedModel
  );

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
      setSelectedBrand("all_brands");
      setSelectedModel("all_models");
      
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
            isLoading={isLoadingItems}
          />
        </div>

        {/* Issue Button */}
        <IssueButton selectedItemId={selectedItemId} />
      </form>
    </Form>
  );
};

export default InventoryIssueForm;
