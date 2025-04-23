import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectValue, SelectItem } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Warehouse } from "@/types/inventory";
import { Plus, Send, Move, Package } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import ItemSelector from "@/components/inventory/ItemSelector";
import ActionBar from "./warehouse-transfer/ActionBar";
import WarehouseTransferTabs from "./warehouse-transfer/WarehouseTransferTabs";
import NewTransferDialog from "./warehouse-transfer/NewTransferDialog";

interface InventoryItem {
  id: string;
  part_name: string;
  brand: string;
  category: string;
  warehouse_id?: string;
  warehouse_name?: string;
  part_number?: string;
  compatible_models?: string[] | null;
  quantity: number;
  purchase_price: number;
}

const WarehouseTransfer = () => {
  const [activeTab, setActiveTab] = useState("transfers");
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loadingWarehouses, setLoadingWarehouses] = useState(false);
  const [transfers, setTransfers] = useState<any[]>([]);
  const [loadingTransfers, setLoadingTransfers] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const [form, setForm] = useState({
    itemId: "",
    quantity: 1,
    sourceWarehouseId: "",
    destinationWarehouseId: "",
    transferMethod: "Courier",
    trackingNumber: "",
    remarks: ""
  });

  const { data: items = [], isLoading: loadingItems } = useQuery({
    queryKey: ['warehouseTransferItems'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('opening_stock_entries')
        .select('*')
        .order('part_name');
      
      if (error) {
        toast.error("Failed to load items: " + error.message);
        throw error;
      }
      
      return data as InventoryItem[];
    }
  });

  useEffect(() => {
    const fetchWarehouses = async () => {
      setLoadingWarehouses(true);
      const { data, error } = await supabase
        .from("warehouses")
        .select("*")
        .eq("is_active", true)
        .order("name");
      
      if (error) {
        toast.error("Failed to load warehouses: " + error.message);
        setLoadingWarehouses(false);
        return;
      }
      
      const transformedWarehouses: Warehouse[] = data.map(warehouse => ({
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
      
      setWarehouses(transformedWarehouses);
      setLoadingWarehouses(false);
    };
    
    fetchWarehouses();
  }, []);

  useEffect(() => {
    const fetchTransfers = async () => {
      setLoadingTransfers(true);
      const { data, error } = await supabase
        .from("inventory_transfers")
        .select(`
          *,
          item:item_id (part_name, brand, category, part_number)
        `)
        .eq("source_type", "Warehouse")
        .eq("destination_type", "Warehouse")
        .order("request_date", { ascending: false });
      
      if (error) {
        toast.error("Failed to load transfers: " + error.message);
        setLoadingTransfers(false);
        return;
      }
      
      setTransfers(data || []);
      setLoadingTransfers(false);
    };
    
    fetchTransfers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) {
      toast.error("Please select an item.");
      return;
    }
    if (!form.sourceWarehouseId || !form.destinationWarehouseId) {
      toast.error("Please select both source and destination warehouses.");
      return;
    }
    if (form.sourceWarehouseId === form.destinationWarehouseId) {
      toast.error("Source and destination warehouses cannot be the same!");
      return;
    }
    
    const { error } = await supabase.from("inventory_transfers").insert({
      item_id: selectedItem.id,
      quantity: form.quantity,
      source_type: "Warehouse",
      source_warehouse_id: form.sourceWarehouseId,
      destination_type: "Warehouse",
      destination_warehouse_id: form.destinationWarehouseId,
      transfer_method: form.transferMethod,
      tracking_number: form.trackingNumber || null,
      remarks: form.remarks || null,
      requested_by: "Current User",
      status: "Requested"
    });
    
    if (error) {
      toast.error("Failed to create warehouse transfer: " + error.message);
      return;
    }
    
    toast.success("Warehouse transfer request created!");
    
    const { data } = await supabase
      .from("inventory_transfers")
      .select(`
        *,
        item:item_id (part_name, brand, category, part_number)
      `)
      .eq("source_type", "Warehouse")
      .eq("destination_type", "Warehouse")
      .order("request_date", { ascending: false });
    
    setTransfers(data || []);
    
    setForm({
      itemId: "",
      quantity: 1,
      sourceWarehouseId: "",
      destinationWarehouseId: "",
      transferMethod: "Courier",
      trackingNumber: "",
      remarks: ""
    });
    setSelectedItem(null);
    setShowDialog(false);
  };

  const getWarehouseName = (id: string) => {
    return warehouses.find(w => w.id === id)?.name || id;
  };
  
  const getWarehouseLocation = (id: string) => {
    return warehouses.find(w => w.id === id)?.location || "";
  };

  const handleItemSelect = (item: any) => {
    setSelectedItem(item);
    setForm({ ...form, itemId: item.id });
  };

  return (
    <div className="container p-6">
      <ActionBar onNewTransfer={() => setShowDialog(true)} />
      <WarehouseTransferTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        transfers={transfers}
        warehouses={warehouses}
        loading={loadingTransfers}
      />
      <NewTransferDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        form={form}
        setForm={setForm}
        onSubmit={handleSubmit}
        loadingItems={loadingItems}
        items={items}
        warehouses={warehouses}
        selectedItem={selectedItem}
        setSelectedItem={setSelectedItem}
      />
    </div>
  );
};

export default WarehouseTransfer;
