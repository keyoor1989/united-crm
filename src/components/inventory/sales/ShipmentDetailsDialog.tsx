
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Truck, Bus, Train, Mail } from "lucide-react";
import { SalesItem } from "./SalesTable";
import { updateShipmentDetails } from "@/services/salesService";

interface ShipmentDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  sale: SalesItem | null;
  onShipmentUpdated: () => void;
}

export const ShipmentDetailsDialog: React.FC<ShipmentDetailsDialogProps> = ({
  open,
  onClose,
  sale,
  onShipmentUpdated
}) => {
  const [shipmentMethod, setShipmentMethod] = useState<string>(sale?.shipmentMethod || 'By Hand');
  const [trackingNumber, setTrackingNumber] = useState<string>("");
  const [courierName, setCourierName] = useState<string>("");
  const [busDetails, setBusDetails] = useState<string>("");
  const [trainDetails, setTrainDetails] = useState<string>("");
  const [additionalDetails, setAdditionalDetails] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when dialog opens with new sale
  React.useEffect(() => {
    if (sale && open) {
      setShipmentMethod(sale.shipmentMethod || 'By Hand');
      
      // Parse shipment details if available
      if (sale.shipmentDetails) {
        try {
          const details = JSON.parse(sale.shipmentDetails);
          setTrackingNumber(details.trackingNumber || "");
          setCourierName(details.courierName || "");
          setBusDetails(details.busDetails || "");
          setTrainDetails(details.trainDetails || "");
          setAdditionalDetails(details.additionalDetails || "");
        } catch (e) {
          // If not JSON, just set as additional details
          setAdditionalDetails(sale.shipmentDetails);
        }
      } else {
        // Reset all fields
        setTrackingNumber("");
        setCourierName("");
        setBusDetails("");
        setTrainDetails("");
        setAdditionalDetails("");
      }
    }
  }, [sale, open]);

  const handleSubmit = async () => {
    if (!sale) return;
    
    setIsSubmitting(true);
    
    // Create shipment details object based on method
    let shipmentDetails = {};
    
    switch (shipmentMethod) {
      case 'By Courier':
        shipmentDetails = {
          trackingNumber,
          courierName,
          additionalDetails
        };
        break;
      case 'By Bus':
        shipmentDetails = {
          busDetails,
          additionalDetails
        };
        break;
      case 'By Train':
        shipmentDetails = {
          trainDetails,
          additionalDetails
        };
        break;
      default:
        shipmentDetails = {
          additionalDetails
        };
    }
    
    // Call API to update shipment details
    const success = await updateShipmentDetails(sale.id, {
      shipmentMethod,
      shipmentDetails: JSON.stringify(shipmentDetails)
    });
    
    setIsSubmitting(false);
    
    if (success) {
      onShipmentUpdated();
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Update Shipment Details</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="shipment-method" className="text-right">
              Shipment Method
            </Label>
            <Select 
              value={shipmentMethod} 
              onValueChange={setShipmentMethod}
            >
              <SelectTrigger id="shipment-method" className="col-span-3">
                <SelectValue placeholder="Select shipment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="By Hand">
                  <div className="flex items-center">
                    <Truck className="mr-2 h-4 w-4" />
                    By Hand
                  </div>
                </SelectItem>
                <SelectItem value="By Courier">
                  <div className="flex items-center">
                    <Mail className="mr-2 h-4 w-4" />
                    By Courier
                  </div>
                </SelectItem>
                <SelectItem value="By Bus">
                  <div className="flex items-center">
                    <Bus className="mr-2 h-4 w-4" />
                    By Bus
                  </div>
                </SelectItem>
                <SelectItem value="By Train">
                  <div className="flex items-center">
                    <Train className="mr-2 h-4 w-4" />
                    By Train
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {shipmentMethod === 'By Courier' && (
            <>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="courier-name" className="text-right">
                  Courier Name
                </Label>
                <Input
                  id="courier-name"
                  value={courierName}
                  onChange={(e) => setCourierName(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="tracking-number" className="text-right">
                  Tracking Number
                </Label>
                <Input
                  id="tracking-number"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="col-span-3"
                />
              </div>
            </>
          )}

          {shipmentMethod === 'By Bus' && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="bus-details" className="text-right">
                Bus Details
              </Label>
              <Input
                id="bus-details"
                value={busDetails}
                onChange={(e) => setBusDetails(e.target.value)}
                placeholder="Bus number, route, etc."
                className="col-span-3"
              />
            </div>
          )}

          {shipmentMethod === 'By Train' && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="train-details" className="text-right">
                Train Details
              </Label>
              <Input
                id="train-details"
                value={trainDetails}
                onChange={(e) => setTrainDetails(e.target.value)}
                placeholder="Train number, route, etc."
                className="col-span-3"
              />
            </div>
          )}

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="additional-details" className="text-right">
              Additional Details
            </Label>
            <Textarea
              id="additional-details"
              value={additionalDetails}
              onChange={(e) => setAdditionalDetails(e.target.value)}
              placeholder="Any additional delivery instructions"
              className="col-span-3"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Updating..." : "Update Shipment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
