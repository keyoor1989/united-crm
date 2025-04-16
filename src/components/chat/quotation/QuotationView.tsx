
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileCheck, FileText, Download } from "lucide-react";
import { useQuotationGenerator } from "./hooks/useQuotationGenerator";
import { ParsedQuotationRequest } from "@/utils/chatCommands/quotationParser";
import { toast } from "sonner";
import { safeGeneratePdf } from "@/utils/pdfGenerator";
import { generateQuotationPdf } from "@/utils/pdf/quotationPdfGenerator";
import { ProductCategory, QuotationStatus } from "@/types/sales";

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
  const quotationGenerator = useQuotationGenerator({ 
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
      toast.info("Preparing PDF for download...");
      
      // Generate customer data and items data from the initialData
      const quotationData = {
        id: "temp-id",
        quotationNumber: "TEMP-" + Date.now(),
        customerId: "",
        customerName: initialData.customerName || "Customer",
        items: initialData.models.map(model => ({
          id: model.productId || `custom-${Date.now()}`,
          productId: model.productId || `custom-${Date.now()}`,
          name: model.model,
          description: `${model.model} Printer/Copier`,
          category: "Copier" as ProductCategory,
          specs: {
            color: true,
            duplex: true
          },
          quantity: model.quantity,
          unitPrice: 150000,
          gstPercent: 18,
          gstAmount: 150000 * 0.18 * model.quantity,
          total: 150000 * 1.18 * model.quantity,
          isCustomItem: true
        })),
        subtotal: initialData.models.reduce((sum, model) => sum + (150000 * model.quantity), 0),
        totalGst: initialData.models.reduce((sum, model) => sum + (150000 * 0.18 * model.quantity), 0),
        grandTotal: initialData.models.reduce((sum, model) => sum + (150000 * 1.18 * model.quantity), 0),
        createdAt: new Date().toISOString(),
        validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        status: "Draft" as QuotationStatus, // Type assertion to ensure compatibility
        notes: "",
        terms: "Payment terms: 50% advance, 50% on delivery.\nDelivery within 7-10 working days after confirmation."
      };
      
      // Use the safeGeneratePdf utility to handle errors and safely generate PDF
      safeGeneratePdf(generateQuotationPdf, quotationData, (error) => {
        console.error("PDF generation error:", error);
        toast.error(`Failed to generate PDF: ${error.message || 'Unknown error'}`);
      });
    } catch (error) {
      console.error("Error in handleDownload:", error);
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
