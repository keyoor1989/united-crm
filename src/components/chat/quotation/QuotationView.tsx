
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileCheck, FileText, Download } from "lucide-react";
import { useQuotationGenerator } from "./useQuotationGenerator";
import { ParsedQuotationRequest } from "@/utils/chatCommands/quotationParser";
import { toast } from "sonner";
import { generateQuotationPdf } from "@/utils/pdfGenerator";

interface QuotationViewProps {
  quotationText: string;
  initialData: ParsedQuotationRequest;
  onConfirm: () => void;
}

const QuotationView: React.FC<QuotationViewProps> = ({ 
  quotationText, 
  initialData,
  onConfirm
}) => {
  const { quotationData } = useQuotationGenerator({ 
    initialData, 
    onComplete: () => {} 
  });
  
  const handleConfirmQuotation = () => {
    onConfirm();
  };
  
  const handleEditQuotation = () => {
    // Open quotation editor dialog
    toast.info("Edit functionality will be available soon");
  };
  
  const handleDownload = () => {
    try {
      if (!quotationData) {
        toast.error("Cannot generate PDF: No quotation data available");
        return;
      }
      
      // Create a deep copy to avoid reference issues
      const quotationCopy = JSON.parse(JSON.stringify(quotationData));
      
      // Call the PDF generator
      generateQuotationPdf(quotationCopy);
      
      toast.success("PDF generation started successfully");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF. Please check console for details.");
    }
  };
  
  return (
    <Card className="mb-4 border-primary/20">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-medium flex items-center">
            <FileText className="mr-2 h-5 w-5 text-primary" />
            Quotation Summary
          </h3>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              onClick={handleEditQuotation}
            >
              Edit Details
            </Button>
            <Button
              variant="outline" 
              size="sm"
              className="h-8"
              onClick={handleDownload}
            >
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            <Button
              size="sm"
              className="h-8"
              onClick={handleConfirmQuotation}
            >
              <FileCheck className="mr-2 h-4 w-4" />
              Create PDF Quotation
            </Button>
          </div>
        </div>
        
        <div className="border-l-4 border-primary/40 pl-4 py-1 whitespace-pre-line">
          {quotationText}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuotationView;
