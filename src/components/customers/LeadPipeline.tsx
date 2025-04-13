
import React from "react";

interface LeadPipelineProps {
  customerId?: string;
}

const LeadPipeline: React.FC<LeadPipelineProps> = ({ customerId }) => {
  if (!customerId) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Please save customer information first to manage lead pipeline.</p>
      </div>
    );
  }
  
  return (
    <div className="p-6 bg-white rounded-lg border">
      <h2 className="text-xl font-semibold mb-4">Lead Pipeline for Customer ID: {customerId}</h2>
      <p className="text-muted-foreground">Lead pipeline visualization and management will be implemented here.</p>
      
      <div className="grid grid-cols-5 gap-4 mt-6">
        <div className="border rounded-md p-4 bg-gray-50">
          <h3 className="font-medium mb-2">New</h3>
          <div className="text-sm text-muted-foreground">Initial contact made</div>
        </div>
        
        <div className="border rounded-md p-4 bg-gray-50">
          <h3 className="font-medium mb-2">Quoted</h3>
          <div className="text-sm text-muted-foreground">Quotation sent</div>
        </div>
        
        <div className="border rounded-md p-4 bg-gray-50">
          <h3 className="font-medium mb-2">Follow-up</h3>
          <div className="text-sm text-muted-foreground">Scheduled for follow-up</div>
        </div>
        
        <div className="border rounded-md p-4 bg-gray-50">
          <h3 className="font-medium mb-2">Converted</h3>
          <div className="text-sm text-muted-foreground">Became a customer</div>
        </div>
        
        <div className="border rounded-md p-4 bg-gray-50">
          <h3 className="font-medium mb-2">Lost</h3>
          <div className="text-sm text-muted-foreground">Lead did not convert</div>
        </div>
      </div>
    </div>
  );
};

export default LeadPipeline;
