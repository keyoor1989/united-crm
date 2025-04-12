
import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import ServiceCallDetail from "@/components/service/ServiceCallDetail";
import { ServiceCall, Engineer } from "@/types/service";

interface ServiceDetailDialogProps {
  showDialog: boolean;
  serviceCall: ServiceCall | null;
  onClose: () => void;
  onUpdate: () => void;
  engineers?: Engineer[]; // Make engineers optional
}

const ServiceDetailDialog: React.FC<ServiceDetailDialogProps> = ({
  showDialog,
  serviceCall,
  onClose,
  onUpdate,
  engineers = [] // Default to empty array
}) => {
  return (
    <Dialog open={showDialog} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        {serviceCall && (
          <ServiceCallDetail 
            serviceCall={serviceCall} 
            engineers={engineers}
            onClose={onClose}
            onUpdate={onUpdate}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ServiceDetailDialog;
