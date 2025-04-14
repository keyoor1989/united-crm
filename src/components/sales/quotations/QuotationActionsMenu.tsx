
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
import { safeGeneratePdf, generateQuotationPdf } from "@/utils/pdfGenerator";
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
      console.log("Quotation data check:", JSON.stringify({
        id: quotation.id,
        quotationNumber: quotation.quotationNumber,
        itemsType: typeof quotation.items,
        isArray: Array.isArray(quotation.items),
        itemsLength: Array.isArray(quotation.items) ? quotation.items.length : 'N/A',
        createdAt: quotation.createdAt,
        validUntil: quotation.validUntil
      }));
      
      // Create a proper deep copy of the quotation to avoid reference issues
      let quotationCopy = JSON.parse(JSON.stringify(quotation));
      
      // Ensure items is always an array
      if (!quotationCopy.items) {
        console.log("No items found, initializing empty array");
        quotationCopy.items = [];
      } else if (typeof quotationCopy.items === 'string') {
        try {
          console.log("Items is a string, attempting to parse:", quotationCopy.items.substring(0, 100) + "...");
          const parsedItems = JSON.parse(quotationCopy.items);
          if (Array.isArray(parsedItems)) {
            quotationCopy.items = parsedItems;
            console.log("Successfully parsed items array with length:", parsedItems.length);
          } else {
            console.error("Parsed items is not an array:", typeof parsedItems);
            quotationCopy.items = [];
          }
        } catch (error) {
          console.error("Failed to parse items string:", error);
          quotationCopy.items = [];
        }
      } else if (!Array.isArray(quotationCopy.items)) {
        console.error("Items is not an array or string:", typeof quotationCopy.items);
        quotationCopy.items = [];
      }
      
      // At this point, items should be an array. Verify just to be sure.
      if (!Array.isArray(quotationCopy.items)) {
        console.error("Items is STILL not an array after all processing:", quotationCopy.items);
        quotationCopy.items = [];
      }
      
      console.log("Final quotation with array items, length:", quotationCopy.items.length);
      
      // Generate PDF directly without using the safe wrapper
      try {
        generateQuotationPdf(quotationCopy);
        toast.success(`PDF for ${quotation.quotationNumber} generated successfully`);
      } catch (pdfError) {
        console.error("Error in direct PDF generation:", pdfError);
        toast.error("Failed to generate PDF. Please try again.");
      }
    } catch (error) {
      console.error("Error in handleDownloadPdf:", error);
      toast.error("Failed to generate PDF. Please try again.");
    }
  };

  const handleCreatePurchaseOrder = () => {
    navigate(`/purchase-order-form?from-quotation=${quotation.id}`);
  };

  const handleUpdateStatus = async (newStatus: QuotationStatus) => {
    try {
      await updateQuotation(quotation.id, { status: newStatus });
      toast.success(`Quotation ${quotation.quotationNumber} is now ${newStatus}.`);
      window.location.reload();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status. Please try again.");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteQuotation(quotation.id);
      toast.success(`Quotation ${quotation.quotationNumber} has been deleted.`);
      window.location.reload();
    } catch (error) {
      console.error("Error deleting quotation:", error);
      toast.error("Failed to delete quotation. Please try again.");
    }
    setShowDeleteDialog(false);
  };

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
