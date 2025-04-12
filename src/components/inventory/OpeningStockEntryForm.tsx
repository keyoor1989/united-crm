import React, { useState, useEffect } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery, QueryClient, QueryClientProvider, useMutation } from "@tanstack/react-query";
import { Brand, Model, Warehouse } from "@/types/inventory";
import { supabase } from "@/integrations/supabase/client";

const queryClient = new QueryClient();

const OpeningStockEntryFormWithQueryClient = (props) => (
  <QueryClientProvider client={queryClient}>
    <OpeningStockEntryForm {...props} />
  </QueryClientProvider>
);

const formSchema = z.object({
  brand: z.string().min(1, { message: "Brand is required" }),
  compatibleModels: z.array(z.string()).min(1, { message: "At least one compatible model is required" }),
  partName: z.string().min(1, { message: "Part name is required" }),
  partNumber: z.string().optional(),
  category: z.string().min(1, { message: "Category is required" }),
  quantity: z.coerce.number().int().min(1, { message: "Quantity must be at least 1" }),
  purchasePrice: z.coerce.number().min(1, { message: "Purchase price is required" }),
  minStock: z.coerce.number().int().min(0).default(5),
  warehouseId: z.string().min(1, { message: "Warehouse is required" }),
});

type FormValues = z.infer<typeof formSchema>;

interface OpeningStockEntryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddPart: (part: any) => void;
}

const categories = ["Toner", "Drum", "Maintenance Kit", "Fuser", "Developer", "Other"];

const fetchBrands = async (): Promise<Brand[]> => {
  try {
    console.log("Fetching brands from Supabase...");
    const { data, error } = await supabase
      .from('inventory_brands')
      .select('*')
      .order('name');
    
    if (error) {
      console.error("Error fetching brands from Supabase:", error);
      return [
        { id: "1", name: "Kyocera", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: "2", name: "Canon", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: "3", name: "HP", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: "4", name: "Konica Minolta", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: "5", name: "Ricoh", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: "6", name: "Sharp", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      ];
    }
    
    if (data && data.length > 0) {
      return data.map(brand => ({
        id: brand.id,
        name: brand.name,
        createdAt: brand.created_at,
        updatedAt: brand.updated_at
      }));
    } else {
      return [
        { id: "1", name: "Kyocera", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: "2", name: "Canon", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: "3", name: "HP", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: "4", name: "Konica Minolta", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: "5", name: "Ricoh", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: "6", name: "Sharp", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      ];
    }
  } catch (error) {
    console.error("Exception fetching brands:", error);
    return [
      { id: "1", name: "Kyocera", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: "2", name: "Canon", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: "3", name: "HP", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: "4", name: "Konica Minolta", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: "5", name: "Ricoh", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: "6", name: "Sharp", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    ];
  }
};

const fetchModelsByBrand = async (brandId: string): Promise<Model[]> => {
  try {
    console.log("Fetching models for brand ID:", brandId);
    const { data, error } = await supabase
      .from('inventory_models')
      .select('*')
      .eq('brand_id', brandId)
      .order('name');
    
    if (error) {
      console.error("Error fetching models from Supabase:", error);
      const allModels: Record<string, Model[]> = {
        "1": [
          { id: "k1", brandId: "1", name: "ECOSYS M2040dn", type: "Machine", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: "k2", brandId: "1", name: "ECOSYS M2540dn", type: "Machine", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: "k3", brandId: "1", name: "ECOSYS M2640idw", type: "Machine", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: "k4", brandId: "1", name: "TASKalfa 2554ci", type: "Machine", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: "k5", brandId: "1", name: "TASKalfa 2553ci", type: "Machine", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: "k6", brandId: "1", name: "TASKalfa 2552ci", type: "Machine", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
        ],
        "2": [
          { id: "c1", brandId: "2", name: "IR 2002", type: "Machine", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: "c2", brandId: "2", name: "IR 2004", type: "Machine", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: "c3", brandId: "2", name: "IR 2006", type: "Machine", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: "c4", brandId: "2", name: "IR ADV 4025", type: "Machine", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: "c5", brandId: "2", name: "IR ADV 4035", type: "Machine", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: "c6", brandId: "2", name: "IR ADV 4045", type: "Machine", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
        ],
        "3": [
          { id: "h1", brandId: "3", name: "LaserJet Pro M402", type: "Machine", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: "h2", brandId: "3", name: "LaserJet Pro M426", type: "Machine", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: "h3", brandId: "3", name: "LaserJet Enterprise M507", type: "Machine", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: "h4", brandId: "3", name: "LaserJet Enterprise M607", type: "Machine", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
        ],
        "4": [
          { id: "km1", brandId: "4", name: "Bizhub C224e", type: "Machine", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: "km2", brandId: "4", name: "Bizhub C284e", type: "Machine", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: "km3", brandId: "4", name: "Bizhub 367", type: "Machine", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: "km4", brandId: "4", name: "Bizhub 458", type: "Machine", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
        ],
        "5": [
          { id: "r1", brandId: "5", name: "MP 2014", type: "Machine", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: "r2", brandId: "5", name: "MP 301", type: "Machine", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: "r3", brandId: "5", name: "Aficio MP 2501L", type: "Machine", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: "r4", brandId: "5", name: "MP C2004", type: "Machine", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
        ],
        "6": [
          { id: "s1", brandId: "6", name: "AR-6020", type: "Machine", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: "s2", brandId: "6", name: "MX-M264N", type: "Machine", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: "s3", brandId: "6", name: "MX-3050N", type: "Machine", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: "s4", brandId: "6", name: "MX-3070N", type: "Machine", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
        ]
      };
      return allModels[brandId] || [];
    }
    
    if (data && data.length > 0) {
      return data.map(model => ({
        id: model.id,
        brandId: model.brand_id,
        name: model.name,
        type: (model.type === "Machine" || model.type === "Spare Part") 
          ? model.type as "Machine" | "Spare Part" 
          : "Machine",
        createdAt: model.created_at,
        updatedAt: model.updated_at
      }));
    } else {
      const allModels: Record<string, Model[]> = {
        "1": [
          { id: "k1", brandId: "1", name: "ECOSYS M2040dn", type: "Machine", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: "k2", brandId: "1", name: "ECOSYS M2540dn", type: "Machine", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: "k3", brandId: "1", name: "ECOSYS M2640idw", type: "Machine", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: "k4", brandId: "1", name: "TASKalfa 2554ci", type: "Machine", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: "k5", brandId: "1", name: "TASKalfa 2553ci", type: "Machine", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: "k6", brandId: "1", name: "TASKalfa 2552ci", type: "Machine", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
        ],
        "2": [
          { id: "c1", brandId: "2", name: "IR 2002", type: "Machine", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: "c2", brandId: "2", name: "IR 2004", type: "Machine", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: "c3", brandId: "2", name: "IR 2006", type: "Machine", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: "c4", brandId: "2", name: "IR ADV 4025", type: "Machine", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: "c5", brandId: "2", name: "IR ADV 4035", type: "Machine", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: "c6", brandId: "2", name: "IR ADV 4045", type: "Machine", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
        ],
        "3": [
          { id: "h1", brandId: "3", name: "LaserJet Pro M402", type: "Machine", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: "h2", brandId: "3", name: "LaserJet Pro M426", type: "Machine", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: "h3", brandId: "3", name: "LaserJet Enterprise M507", type: "Machine", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: "h4", brandId: "3", name: "LaserJet Enterprise M607", type: "Machine", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
        ],
        "4": [
          { id: "km1", brandId: "4", name: "Bizhub C224e", type: "Machine", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: "km2", brandId: "4", name: "Bizhub C284e", type: "Machine", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: "km3", brandId: "4", name: "Bizhub 367", type: "Machine", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: "km4", brandId: "4", name: "Bizhub 458", type: "Machine", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
        ],
        "5": [
          { id: "r1", brandId: "5", name: "MP 2014", type: "Machine", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: "r2", brandId: "5", name: "MP 301", type: "Machine", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: "r3", brandId: "5", name: "Aficio MP 2501L", type: "Machine", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: "r4", brandId: "5", name: "MP C2004", type: "Machine", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
        ],
        "6": [
          { id: "s1", brandId: "6", name: "AR-6020", type: "Machine", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: "s2", brandId: "6", name: "MX-M264N", type: "Machine", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: "s3", brandId: "6", name: "MX-3050N", type: "Machine", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: "s4", brandId: "6", name: "MX-3070N", type: "Machine", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
        ]
      };
      return allModels[brandId] || [];
    }
  } catch (error) {
    console.error("Exception fetching models:", error);
    const allModels: Record<string, Model[]> = {
      "1": [
        { id: "k1", brandId: "1", name: "ECOSYS M2040dn", type: "Machine", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: "k2", brandId: "1", name: "ECOSYS M2540dn", type: "Machine", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: "k3", brandId: "1", name: "ECOSYS M2640idw", type: "Machine", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: "k4", brandId: "1", name: "TASKalfa 2554ci", type: "Machine", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: "k5", brandId: "1", name: "TASKalfa 2553ci", type: "Machine", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: "k6", brandId: "1", name: "TASKalfa 2552ci", type: "Machine", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      ],
      "2": [
        { id: "c1", brandId: "2", name: "IR 2002", type: "Machine", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: "c2", brandId: "2", name: "IR 2004", type: "Machine", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: "c3", brandId: "2", name: "IR 2006", type: "Machine", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: "c4", brandId: "2", name: "IR ADV 4025", type: "Machine", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: "c5", brandId: "2", name: "IR ADV 4035", type: "Machine", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: "c6", brandId: "2", name: "IR ADV 4045", type: "Machine", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      ],
      "3": [
        { id: "h1", brandId: "3", name: "LaserJet Pro M402", type: "Machine", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: "h2", brandId: "3", name: "LaserJet Pro M426", type: "Machine", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: "h3", brandId: "3", name: "LaserJet Enterprise M507", type: "Machine", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: "h4", brandId: "3", name: "LaserJet Enterprise M607", type: "Machine", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      ],
      "4": [
        { id: "km1", brandId: "4", name: "Bizhub C224e", type: "Machine", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: "km2", brandId: "4", name: "Bizhub C284e", type: "Machine", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: "km3", brandId: "4", name: "Bizhub 367", type: "Machine", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: "km4", brandId: "4", name: "Bizhub 458", type: "Machine", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      ],
      "5": [
        { id: "r1", brandId: "5", name: "MP 2014", type: "Machine", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: "r2", brandId: "5", name: "MP 301", type: "Machine", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: "r3", brandId: "5", name: "Aficio MP 2501L", type: "Machine", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: "r4", brandId: "5", name: "MP C2004", type: "Machine", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      ],
      "6": [
        { id: "s1", brandId: "6", name: "AR-6020", type: "Machine", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: "s2", brandId: "6", name: "MX-M264N", type: "Machine", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: "s3", brandId: "6", name: "MX-3050N", type: "Machine", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: "s4", brandId: "6", name: "MX-3070N", type: "Machine", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      ]
    };
    return allModels[brandId] || [];
  }
};

const fetchWarehouses = async (): Promise<Warehouse[]> => {
  try {
    console.log("Fetching warehouses from Supabase...");
    const { data, error } = await supabase
      .from('warehouses')
      .select('*')
      .eq('is_active', true)
      .order('name');
      
    if (error) {
      console.error("Error fetching warehouses:", error);
      throw error;
    }
    
    console.log("Warehouse data from Supabase:", data);
    
    if (data && data.length > 0) {
      return data.map(warehouse => ({
        id: warehouse.id,
        name: warehouse.name,
        code: warehouse.code,
        location: warehouse.location,
        address: warehouse.address,
        contactPerson: warehouse.contact_person,
        contactPhone: warehouse.contact_phone,
        isActive: warehouse.is_active,
        createdAt: warehouse.created_at
      }));
    } else {
      console.log("No warehouse data from Supabase");
      return [];
    }
  } catch (error) {
    console.error("Exception fetching warehouses:", error);
    throw error;
  }
};

const OpeningStockEntryForm = ({ open, onOpenChange, onAddPart }: OpeningStockEntryFormProps) => {
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  
  const { data: brands = [], isLoading: isLoadingBrands } = useQuery({
    queryKey: ['brands'],
    queryFn: fetchBrands
  });
  
  const { data: warehouses = [], isLoading: isLoadingWarehouses, refetch: refetchWarehouses } = useQuery({
    queryKey: ['warehouses'],
    queryFn: fetchWarehouses,
    staleTime: 0,
    refetchOnWindowFocus: true
  });
  
  console.log("Warehouse data in component:", warehouses);
  
  const { data: models = [], isLoading: isLoadingModels } = useQuery({
    queryKey: ['models', selectedBrand],
    queryFn: () => selectedBrand ? fetchModelsByBrand(selectedBrand) : Promise.resolve([]),
    enabled: !!selectedBrand
  });

  const saveStockEntryMutation = useMutation({
    mutationFn: async (newPart: any) => {
      try {
        console.log("Saving opening stock entry to Supabase:", newPart);
        
        if (!newPart.warehouseId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(newPart.warehouseId)) {
          throw new Error("Invalid warehouse ID format. Must be a valid UUID.");
        }
        
        const { data, error } = await supabase
          .from('opening_stock_entries')
          .insert({
            part_number: newPart.partNumber,
            part_name: newPart.name,
            brand: newPart.brand,
            category: newPart.category,
            compatible_models: newPart.compatibleModels,
            quantity: newPart.currentStock,
            min_stock: newPart.minStock,
            purchase_price: newPart.purchasePrice,
            warehouse_id: newPart.warehouseId,
            warehouse_name: newPart.warehouseName,
          })
          .select()
          .single();
          
        if (error) {
          console.error("Error saving opening stock entry to Supabase:", error);
          throw error;
        }
        
        console.log("Successfully saved to Supabase:", data);
        return data;
      } catch (error) {
        console.error("Exception saving opening stock entry:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opening-stock-entries'] });
      queryClient.invalidateQueries({ queryKey: ['machine-parts'] });
    },
    onError: (error) => {
      console.error("Error saving opening stock entry:", error);
      // We'll let the parent component handle the UI notification
    }
  });
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      brand: "",
      compatibleModels: [],
      partName: "",
      partNumber: "",
      category: "",
      quantity: 1,
      purchasePrice: 0,
      minStock: 5,
      warehouseId: "",
    },
  });

  useEffect(() => {
    if (open) {
      refetchWarehouses();
    }
  }, [open, refetchWarehouses]);

  const handleSubmit = async (values: FormValues) => {
    try {
      const warehouseInfo = warehouses.find(w => w.id === values.warehouseId);
      console.log("Selected warehouse:", warehouseInfo);
      
      if (!warehouseInfo) {
        toast.error("Invalid warehouse selected");
        return;
      }
      
      const newPart = {
        id: `MP${Math.floor(Math.random() * 10000).toString().padStart(3, '0')}`,
        partNumber: values.partNumber || `${values.brand.substring(0, 2)}-${Math.floor(Math.random() * 10000)}`,
        name: values.partName,
        brand: brands.find(b => b.id === values.brand)?.name || values.brand,
        compatibleModels: values.compatibleModels,
        category: values.category,
        currentStock: values.quantity,
        minStock: values.minStock,
        purchasePrice: values.purchasePrice,
        warehouseId: values.warehouseId,
        warehouseName: warehouseInfo.name,
      };

      console.log("Submitting new part:", newPart);

      try {
        await saveStockEntryMutation.mutateAsync(newPart);
        
        toast.success("Opening stock entry added successfully!");
        
        onAddPart(newPart);
        
        form.reset();
        setSelectedModels([]);
        onOpenChange(false);
      } catch (error) {
        console.error("Error saving to database:", error);
        toast.error("Failed to save to database: " + (error instanceof Error ? error.message : "Unknown error"));
      }
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("Error adding opening stock entry");
    }
  };

  const handleBrandChange = (value: string) => {
    setSelectedBrand(value);
    form.setValue("brand", value);
    form.setValue("compatibleModels", []);
    setSelectedModels([]);
  };

  const handleModelChange = (model: string, checked: boolean) => {
    const updatedModels = checked
      ? [...selectedModels, model]
      : selectedModels.filter(m => m !== model);
    
    setSelectedModels(updatedModels);
    form.setValue("compatibleModels", updatedModels);
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
                        {isLoadingBrands ? (
                          <SelectItem value="loading" disabled>Loading brands...</SelectItem>
                        ) : brands.length > 0 ? (
                          brands.map((brand) => (
                            <SelectItem key={brand.id} value={brand.id}>
                              {brand.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no_brands" disabled>No brands available</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="compatibleModels"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Compatible Models</FormLabel>
                    <FormControl>
                      <div className="border rounded-md overflow-hidden">
                        {selectedBrand ? (
                          isLoadingModels ? (
                            <div className="h-[100px] flex items-center justify-center">
                              <p className="text-sm text-muted-foreground">Loading models...</p>
                            </div>
                          ) : (
                            <ScrollArea className="h-[100px] p-2">
                              <div className="space-y-2">
                                {models.length > 0 ? (
                                  models.map((model) => (
                                    <div key={model.id} className="flex items-center space-x-2">
                                      <Checkbox 
                                        id={`model-${model.id}`} 
                                        checked={selectedModels.includes(model.name)}
                                        onCheckedChange={(checked) => 
                                          handleModelChange(model.name, checked as boolean)
                                        }
                                      />
                                      <label
                                        htmlFor={`model-${model.id}`}
                                        className="text-sm cursor-pointer"
                                      >
                                        {model.name}
                                      </label>
                                    </div>
                                  ))
                                ) : (
                                  <div className="text-sm text-muted-foreground p-2">
                                    No models available for this brand
                                  </div>
                                )}
                              </div>
                            </ScrollArea>
                          )
                        ) : (
                          <div className="h-[100px] flex items-center justify-center text-sm text-muted-foreground">
                            Select a brand first
                          </div>
                        )}
                      </div>
                    </FormControl>
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
            
            <FormField
              control={form.control}
              name="warehouseId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Warehouse Location</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select warehouse" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isLoadingWarehouses ? (
                        <SelectItem value="loading_warehouses" disabled>Loading warehouses...</SelectItem>
                      ) : warehouses.length > 0 ? (
                        warehouses.map((warehouse) => (
                          <SelectItem key={warehouse.id} value={warehouse.id}>
                            {warehouse.name} ({warehouse.location})
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no_warehouses" disabled>No warehouses available</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {selectedModels.length > 0 && (
              <div className="border p-2 rounded-md bg-slate-50">
                <p className="text-sm font-medium mb-1">Selected Models:</p>
                <div className="flex flex-wrap gap-1">
                  {selectedModels.map(model => (
                    <span key={model} className="bg-slate-200 px-2 py-1 rounded text-xs">
                      {model}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={selectedModels.length === 0 || saveStockEntryMutation.isPending}
              >
                {saveStockEntryMutation.isPending ? "Saving..." : "Add Opening Stock"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default OpeningStockEntryFormWithQueryClient;
