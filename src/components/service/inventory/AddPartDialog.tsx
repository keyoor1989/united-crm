
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ServiceCall, Part } from '@/types/service';

interface AddPartDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (part: Partial<Part>) => void;
  serviceCall: ServiceCall | null;
}

const AddPartDialog: React.FC<AddPartDialogProps> = ({ open, onClose, onSave, serviceCall }) => {
  const [partName, setPartName] = useState('');
  const [partNumber, setPartNumber] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(0);
  const [cost, setCost] = useState(0);

  if (!serviceCall) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Calculate profit if both price and cost are provided
    const profit = price > 0 && cost > 0 ? (price - cost) * quantity : undefined;
    
    onSave({
      name: partName,
      partNumber,
      quantity,
      price,
      cost: cost > 0 ? cost : undefined,
      profit
    });
    
    // Reset form
    setPartName('');
    setPartNumber('');
    setQuantity(1);
    setPrice(0);
    setCost(0);
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
          
          <div className="grid gap-2">
            <Label htmlFor="partName">Part Name</Label>
            <Input
              id="partName"
              value={partName}
              onChange={(e) => setPartName(e.target.value)}
              required
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="partNumber">Part Number</Label>
            <Input
              id="partNumber"
              value={partNumber}
              onChange={(e) => setPartNumber(e.target.value)}
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
