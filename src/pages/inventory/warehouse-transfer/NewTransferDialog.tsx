
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectValue, SelectItem } from "@/components/ui/select";
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Warehouse } from "@/types/inventory";

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

interface NewTransferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: any;
  setForm: (f: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  loadingItems: boolean;
  items: InventoryItem[];
  warehouses: Warehouse[];
  selectedItem: InventoryItem | null;
  setSelectedItem: (item: InventoryItem | null) => void;
}

const NewTransferDialog = ({
  open,
  onOpenChange,
  form,
  setForm,
  onSubmit,
  loadingItems,
  items,
  warehouses,
  selectedItem,
  setSelectedItem,
}: NewTransferDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="sm:max-w-[740px]">
      <DialogHeader>
        <DialogTitle>New Warehouse Transfer</DialogTitle>
        <DialogDescription>
          Create a warehouse to warehouse transfer request
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={onSubmit} className="space-y-4">
        {/* Item Selection */}
        <div className="space-y-2">
          <Label htmlFor="item-id">Select Item to Transfer</Label>
          {loadingItems ? (
            <div className="h-12 bg-muted animate-pulse rounded-md"></div>
          ) : (
            <div className="border rounded-md">
              <ScrollArea className="h-[300px]">
                <Table>
                  <TableHeader className="sticky top-0 bg-background z-10">
                    <TableRow>
                      <TableHead>Item Name</TableHead>
                      <TableHead>Brand</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Current Warehouse</TableHead>
                      <TableHead>Quantity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4">No items found.</TableCell>
                      </TableRow>
                    ) : (
                      items.map(item => (
                        <TableRow 
                          key={item.id} 
                          className={selectedItem?.id === item.id ? "bg-muted cursor-pointer" : "cursor-pointer"}
                          onClick={() => { setSelectedItem(item); setForm((f: any) => ({ ...f, itemId: item.id })); }}
                        >
                          <TableCell className="font-medium">{item.part_name}</TableCell>
                          <TableCell>{item.brand}</TableCell>
                          <TableCell>{item.category}</TableCell>
                          <TableCell>{item.warehouse_name || "Not specified"}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity</Label>
          <Input
            id="quantity"
            type="number"
            min={1}
            max={selectedItem?.quantity || 1}
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
                {/* Added explicit placeholder option with non-empty string value */}
                <SelectItem key="source-placeholder" value="placeholder-source" disabled>
                  Select Source Warehouse
                </SelectItem>
                {warehouses.map(w => 
                  w.id ? (
                    <SelectItem key={w.id} value={w.id}>
                      {w.name} ({w.location})
                    </SelectItem>
                  ) : null
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
                {/* Added explicit placeholder option with non-empty string value */}
                <SelectItem key="dest-placeholder" value="placeholder-dest" disabled>
                  Select Destination Warehouse
                </SelectItem>
                {warehouses.map(w => 
                  w.id ? (
                    <SelectItem key={w.id} value={w.id}>
                      {w.name} ({w.location})
                    </SelectItem>
                  ) : null
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
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={!selectedItem}>
            <Send className="h-4 w-4 mr-2" />
            Create Transfer Request
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
);

export default NewTransferDialog;
