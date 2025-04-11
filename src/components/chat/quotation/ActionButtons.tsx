
import React from "react";
import { Button } from "@/components/ui/button";
import { FileDown, Send } from "lucide-react";

interface ActionButtonsProps {
  onCancel: () => void;
  onGenerateQuotation: () => void;
  onGeneratePdf?: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  onCancel,
  onGenerateQuotation,
  onGeneratePdf
}) => {
  return (
    <div className="flex justify-between pt-2">
      <Button variant="outline" onClick={onCancel}>
        Cancel
      </Button>
      
      <div className="space-x-2">
        {onGeneratePdf && (
          <Button 
            variant="outline" 
            onClick={onGeneratePdf}
          >
            <FileDown className="h-4 w-4 mr-2" />
            Generate PDF
          </Button>
        )}
        
        <Button onClick={onGenerateQuotation}>
          <Send className="h-4 w-4 mr-2" />
          Create Quotation
        </Button>
      </div>
    </div>
  );
};

export default ActionButtons;
