
import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import ServiceCallDetail from "@/components/service/ServiceCallDetail";
import { ServiceCall } from "@/types/service";

interface ServiceDetailDialogProps {
  showDialog: boolean;
  serviceCall: ServiceCall | null;
  onClose: () => void;
  onUpdate: () => void;
}

const ServiceDetailDialog: React.FC<ServiceDetailDialogProps> = ({
  showDialog,
  serviceCall,
  onClose,
  onUpdate
}) => {
  return (
    <Dialog open={showDialog} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        {serviceCall && (
          <ServiceCallDetail 
            serviceCall={serviceCall} 
            onClose={onClose}
            onUpdate={onUpdate}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ServiceDetailDialog;
