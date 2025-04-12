
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ServiceCall, Part } from '@/types/service';
import { useEngineerItems } from '@/hooks/inventory/useEngineerItems';
import { Spinner } from '@/components/ui/spinner';

interface AddPartDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (part: Partial<Part>) => void;
  serviceCall: ServiceCall | null;
}

const AddPartDialog: React.FC<AddPartDialogProps> = ({ open, onClose, onSave, serviceCall }) => {
  const [selectedPartId, setSelectedPartId] = useState<string>('');
  const [partName, setPartName] = useState('');
  const [partNumber, setPartNumber] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(0);
  const [cost, setCost] = useState(0);
  const [manualEntry, setManualEntry] = useState(false);

  const { items, isLoading, error } = useEngineerItems(serviceCall?.engineerId || null);

  useEffect(() => {
    if (open) {
      setSelectedPartId('');
      setPartName('');
      setPartNumber('');
      setQuantity(1);
      setPrice(0);
      setCost(0);
      setManualEntry(false);
    }
  }, [open]);

  useEffect(() => {
    if (selectedPartId && !manualEntry) {
      const selectedItem = items.find(item => item.id === selectedPartId);
      if (selectedItem) {
        setPartName(selectedItem.item_name);
        setPartNumber(selectedItem.model_number || '');
      }
    }
  }, [selectedPartId, items, manualEntry]);

  if (!serviceCall) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const profit = price > 0 && cost > 0 ? (price - cost) * quantity : undefined;
    
    onSave({
      name: partName,
      partNumber,
      quantity,
      price,
      cost: cost > 0 ? cost : undefined,
      profit
    });
  };

  const toggleManualEntry = () => {
    setManualEntry(!manualEntry);
    if (!manualEntry) {
      setSelectedPartId('');
    } else {
      setPartName('');
      setPartNumber('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Part Used on Service Call</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid gap-2">
            <div className="text-sm font-medium mb-2">
              Service Call: <span className="font-bold">{serviceCall.customerName}</span>
              <div className="text-muted-foreground text-xs">{serviceCall.machineModel} • Engineer: {serviceCall.engineerName}</div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={toggleManualEntry}
            >
              {manualEntry ? "Select from Inventory" : "Manual Entry"}
            </Button>
          </div>
          
          {!manualEntry ? (
            <div className="grid gap-2">
              <Label htmlFor="partSelect">Select Part from Engineer Inventory</Label>
              {isLoading ? (
                <div className="flex items-center justify-center h-10">
                  <Spinner className="h-4 w-4 mr-2" /> Loading...
                </div>
              ) : error ? (
                <div className="text-red-500 text-sm">Failed to load engineer inventory</div>
              ) : items.length === 0 ? (
                <div className="text-amber-500 text-sm">No items found in engineer's inventory</div>
              ) : (
                <Select value={selectedPartId} onValueChange={setSelectedPartId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a part" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {items.map(item => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.item_name} ({item.quantity} available)
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            </div>
          ) : (
            <div className="grid gap-2">
              <Label htmlFor="partName">Part Name</Label>
              <Input
                id="partName"
                value={partName}
                onChange={(e) => setPartName(e.target.value)}
                required
                placeholder="Enter part name manually"
              />
            </div>
          )}
          
          <div className="grid gap-2">
            <Label htmlFor="partNumber">Part Number</Label>
            <Input
              id="partNumber"
              value={partNumber}
              onChange={(e) => setPartNumber(e.target.value)}
              placeholder={manualEntry ? "Enter part number manually" : "Auto-filled from inventory"}
              disabled={!manualEntry && !!selectedPartId}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="price">Unit Price (₹)</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                required
              />
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="cost">Unit Cost (₹) (Optional)</Label>
            <Input
              id="cost"
              type="number"
              min="0"
              step="0.01"
              value={cost}
              onChange={(e) => setCost(parseFloat(e.target.value) || 0)}
            />
            <p className="text-xs text-muted-foreground">
              Cost is used to calculate profit. Leave at 0 if unknown.
            </p>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Add Part</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddPartDialog;
