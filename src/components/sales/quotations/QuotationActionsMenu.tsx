import React from "react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { 
  MoreHorizontal, Eye, FileDown, FilePenLine, 
  Trash2, CheckCircle, X, ShoppingBasket 
} from "lucide-react";
import { Quotation, QuotationStatus } from "@/types/sales";
import { generateQuotationPdf } from "@/utils/pdf/quotationPdfGenerator";
import { updateQuotation, deleteQuotation } from "@/services/quotationService";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { safeGeneratePdf } from "@/utils/pdfGenerator";

interface QuotationActionsMenuProps {
  quotation: Quotation;
}

const QuotationActionsMenu: React.FC<QuotationActionsMenuProps> = ({ quotation }) => {
  const navigate = useNavigate();
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const { toast: uiToast } = useToast();

  const handleViewDetails = () => {
    navigate(`/quotation/${quotation.id}`);
  };

  const handleEdit = () => {
    navigate(`/quotation-form/${quotation.id}`);
  };

  const handleDownloadPdf = () => {
    try {
      console.log("Starting PDF generation for quotation:", quotation.quotationNumber);
      
      // Create a proper deep copy of the quotation to avoid reference issues
      const quotationCopy = JSON.parse(JSON.stringify(quotation));
      
      // Use the safer PDF generator with proper error handling
      safeGeneratePdf(generateQuotationPdf, quotationCopy, (error) => {
        console.error("PDF generation error:", error);
        toast.error(`Failed to generate PDF: ${error.message || 'Unknown error'}`);
      });
      
      toast.success(`PDF for ${quotation.quotationNumber} generated successfully`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF. Please try again.");
    }
  };

  function handleCreatePurchaseOrder() {
    navigate(`/purchase-order-form?from-quotation=${quotation.id}`);
  }
  
  async function handleUpdateStatus(newStatus: QuotationStatus) {
    try {
      await updateQuotation(quotation.id, { status: newStatus });
      toast.success(`Quotation ${quotation.quotationNumber} is now ${newStatus}.`);
      window.location.reload();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status. Please try again.");
    }
  }
  
  async function handleDelete() {
    try {
      await deleteQuotation(quotation.id);
      toast.success(`Quotation ${quotation.quotationNumber} has been deleted.`);
      window.location.reload();
    } catch (error) {
      console.error("Error deleting quotation:", error);
      toast.error("Failed to delete quotation. Please try again.");
    }
    setShowDeleteDialog(false);
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleViewDetails}>
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleEdit}>
            <FilePenLine className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDownloadPdf}>
            <FileDown className="mr-2 h-4 w-4" />
            Download PDF
          </DropdownMenuItem>
          
          {quotation.status === "Sent" && (
            <DropdownMenuItem onClick={() => handleUpdateStatus("Accepted")}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Mark as Accepted
            </DropdownMenuItem>
          )}
          
          {quotation.status === "Sent" && (
            <DropdownMenuItem onClick={() => handleUpdateStatus("Rejected")}>
              <X className="mr-2 h-4 w-4" />
              Mark as Rejected
            </DropdownMenuItem>
          )}
          
          {quotation.status === "Accepted" && (
            <DropdownMenuItem onClick={handleCreatePurchaseOrder}>
              <ShoppingBasket className="mr-2 h-4 w-4" />
              Create Purchase Order
            </DropdownMenuItem>
          )}
          
          <DropdownMenuItem onClick={() => setShowDeleteDialog(true)} className="text-destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete Quotation {quotation.quotationNumber}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default QuotationActionsMenu;
