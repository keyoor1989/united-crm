
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

// MOCK items only
const mockItems = [
  { id: "1", name: "Black Toner", brand: "Kyocera", model: "2554ci" },
  { id: "2", name: "Drum Unit", brand: "Kyocera", model: "2554ci" },
  { id: "3", name: "Fuser Unit", brand: "Ricoh", model: "MP2014" },
  { id: "4", name: "Cyan Toner", brand: "Kyocera", model: "2554ci" }
];

const WarehouseTransfer = () => {
  const [activeTab, setActiveTab] = useState("transfers");
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loadingWarehouses, setLoadingWarehouses] = useState(false);
  const [transfers, setTransfers] = useState<any[]>([]);
  const [loadingTransfers, setLoadingTransfers] = useState(false);

  const [showDialog, setShowDialog] = useState(false);
  const [form, setForm] = useState({
    itemId: "",
    quantity: 1,
    sourceWarehouseId: "",
    destinationWarehouseId: "",
    transferMethod: "Courier",
    trackingNumber: "",
    remarks: ""
  });

  // Fetch warehouses from Supabase
  useEffect(() => {
    const fetchWarehouses = async () => {
      setLoadingWarehouses(true);
      const { data, error } = await supabase.from("warehouses").select("*").eq("is_active", true).order("name");
      if (error) {
        toast.error("Failed to load warehouses: " + error.message);
        setLoadingWarehouses(false);
        return;
      }

      // Transform the data to match the Warehouse interface
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

  // Fetch only warehouse-to-warehouse transfers
  useEffect(() => {
    const fetchTransfers = async () => {
      setLoadingTransfers(true);
      const { data, error } = await supabase
        .from("inventory_transfers")
        .select("*")
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

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.itemId) {
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
    // Insert transfer
    const { error } = await supabase.from("inventory_transfers").insert({
      item_id: form.itemId,
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
    // Reload transfers
    const { data } = await supabase
      .from("inventory_transfers")
      .select("*")
      .eq("source_type", "Warehouse")
      .eq("destination_type", "Warehouse")
      .order("request_date", { ascending: false });
    setTransfers(data || []);
    // Reset form and close dialog
    setForm({
      itemId: "",
      quantity: 1,
      sourceWarehouseId: "",
      destinationWarehouseId: "",
      transferMethod: "Courier",
      trackingNumber: "",
      remarks: ""
    });
    setShowDialog(false);
  };

  // Get warehouse name from id
  const getWarehouseName = (id: string) => {
    return warehouses.find(w => w.id === id)?.name || id;
  };
  const getWarehouseLocation = (id: string) => {
    return warehouses.find(w => w.id === id)?.location || "";
  };

  return (
    <div className="container p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Warehouse Transfers</h1>
          <p className="text-muted-foreground">Transfer stock from one warehouse to another (Live)</p>
        </div>
        <Button className="gap-1" onClick={() => setShowDialog(true)}>
          <Plus className="h-4 w-4" />
          New Warehouse Transfer
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="transfers">Active Transfers</TabsTrigger>
          <TabsTrigger value="history">Transfer History</TabsTrigger>
        </TabsList>
        {/* Active Transfers */}
        <TabsContent value="transfers" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Current Transfers</CardTitle>
              <CardDescription>
                All ongoing warehouse transfers (not "Received" or "Cancelled")
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transfer ID</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Source Warehouse</TableHead>
                    <TableHead>Destination Warehouse</TableHead>
                    <TableHead>Request Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Method</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingTransfers && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center">Loading...</TableCell>
                    </TableRow>
                  )}
                  {!loadingTransfers && transfers.filter(t => t.status !== "Received" && t.status !== "Cancelled").map((transfer) => (
                    <TableRow key={transfer.id}>
                      <TableCell className="font-medium">{transfer.id}</TableCell>
                      <TableCell>
                        <div className="flex gap-2 items-center"><Package className="h-4 w-4" />{transfer.item_id}
                        <span className="text-xs text-muted-foreground ml-1">
                          {mockItems.find(i => i.id === transfer.item_id)?.brand} {mockItems.find(i => i.id === transfer.item_id)?.model}
                        </span>
                        </div>
                      </TableCell>
                      <TableCell>{transfer.quantity}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <Move className="h-4 w-4" />
                          {getWarehouseName(transfer.source_warehouse_id)}
                          {getWarehouseLocation(transfer.source_warehouse_id) && (
                            <span className="ml-2 text-xs text-muted-foreground">{getWarehouseLocation(transfer.source_warehouse_id)}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <Move className="h-4 w-4" />
                          {getWarehouseName(transfer.destination_warehouse_id)}
                          {getWarehouseLocation(transfer.destination_warehouse_id) && (
                            <span className="ml-2 text-xs text-muted-foreground">{getWarehouseLocation(transfer.destination_warehouse_id)}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {transfer.request_date ? new Date(transfer.request_date).toLocaleDateString() : "-"}
                      </TableCell>
                      <TableCell>
                        <span className="rounded px-2 py-1 text-xs bg-muted">{transfer.status}</span>
                      </TableCell>
                      <TableCell>{transfer.transfer_method || "-"}</TableCell>
                    </TableRow>
                  ))}
                  {!loadingTransfers && transfers.filter(t => t.status !== "Received" && t.status !== "Cancelled").length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">No active warehouse transfers</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        {/* History */}
        <TabsContent value="history" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Transfer History</CardTitle>
              <CardDescription>
                Completed and cancelled warehouse transfers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transfer ID</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Source Warehouse</TableHead>
                    <TableHead>Destination Warehouse</TableHead>
                    <TableHead>Request Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Method</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingTransfers && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center">Loading...</TableCell>
                    </TableRow>
                  )}
                  {!loadingTransfers && transfers.filter(t => t.status === "Received" || t.status === "Cancelled").map((transfer) => (
                    <TableRow key={transfer.id}>
                      <TableCell className="font-medium">{transfer.id}</TableCell>
                      <TableCell>
                        <div className="flex gap-2 items-center"><Package className="h-4 w-4" />{transfer.item_id}
                        <span className="text-xs text-muted-foreground ml-1">
                          {mockItems.find(i => i.id === transfer.item_id)?.brand} {mockItems.find(i => i.id === transfer.item_id)?.model}
                        </span>
                        </div>
                      </TableCell>
                      <TableCell>{transfer.quantity}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <Move className="h-4 w-4" />
                          {getWarehouseName(transfer.source_warehouse_id)}
                          {getWarehouseLocation(transfer.source_warehouse_id) && (
                            <span className="ml-2 text-xs text-muted-foreground">{getWarehouseLocation(transfer.source_warehouse_id)}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <Move className="h-4 w-4" />
                          {getWarehouseName(transfer.destination_warehouse_id)}
                          {getWarehouseLocation(transfer.destination_warehouse_id) && (
                            <span className="ml-2 text-xs text-muted-foreground">{getWarehouseLocation(transfer.destination_warehouse_id)}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {transfer.request_date ? new Date(transfer.request_date).toLocaleDateString() : "-"}
                      </TableCell>
                      <TableCell>
                        <span className="rounded px-2 py-1 text-xs bg-muted">{transfer.status}</span>
                      </TableCell>
                      <TableCell>{transfer.transfer_method || "-"}</TableCell>
                    </TableRow>
                  ))}
                  {!loadingTransfers && transfers.filter(t => t.status === "Received" || t.status === "Cancelled").length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">No history transfers</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[540px]">
          <DialogHeader>
            <DialogTitle>New Warehouse Transfer</DialogTitle>
            <DialogDescription>
              Create a warehouse to warehouse transfer request
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="item-id">Item</Label>
              <Select
                value={form.itemId}
                onValueChange={(value) => setForm({ ...form, itemId: value })}
              >
                <SelectTrigger id="item-id">
                  <SelectValue placeholder="Select Item" />
                </SelectTrigger>
                <SelectContent>
                  {mockItems.map(item => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name} - {item.brand} {item.model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min={1}
                value={form.quantity}
                onChange={e => setForm({ ...form, quantity: parseInt(e.target.value) })}
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Source Warehouse</Label>
                <Select
                  value={form.sourceWarehouseId}
                  onValueChange={(value) => setForm({ ...form, sourceWarehouseId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Source Warehouse" />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses.map(w =>
                      <SelectItem key={w.id} value={w.id}>
                        {w.name} ({w.location})
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Destination Warehouse</Label>
                <Select
                  value={form.destinationWarehouseId}
                  onValueChange={(value) => setForm({ ...form, destinationWarehouseId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Destination Warehouse" />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses.map(w =>
                      <SelectItem key={w.id} value={w.id}>
                        {w.name} ({w.location})
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Transfer Method</Label>
              <Select
                value={form.transferMethod}
                onValueChange={(value) => setForm({ ...form, transferMethod: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Courier">Courier</SelectItem>
                  <SelectItem value="Hand Delivery">Hand Delivery</SelectItem>
                  <SelectItem value="Bus">Bus</SelectItem>
                  <SelectItem value="Railway">Railway</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {form.transferMethod !== "Hand Delivery" && (
              <div className="space-y-2">
                <Label>Tracking Number (optional)</Label>
                <Input
                  placeholder="Enter tracking number if available"
                  value={form.trackingNumber}
                  onChange={e => setForm({ ...form, trackingNumber: e.target.value })}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label>Remarks</Label>
              <Input
                placeholder="Any additional notes"
                value={form.remarks}
                onChange={e => setForm({ ...form, remarks: e.target.value })}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">
                <Send className="h-4 w-4 mr-2" />
                Create Transfer Request
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WarehouseTransfer;
