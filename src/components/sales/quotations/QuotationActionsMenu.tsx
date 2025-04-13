
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

interface QuotationActionsMenuProps {
  quotation: Quotation;
}

const QuotationActionsMenu: React.FC<QuotationActionsMenuProps> = ({ quotation }) => {
  const navigate = useNavigate();
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const { toast } = useToast();

  const handleViewDetails = () => {
    navigate(`/quotation/${quotation.id}`);
  };

  const handleEdit = () => {
    navigate(`/quotation-form/${quotation.id}`);
  };

  const handleDownloadPdf = () => {
    try {
      generateQuotationPdf(quotation);
      toast({
        title: "PDF Generated",
        description: `Quotation ${quotation.quotationNumber} has been downloaded.`
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleCreatePurchaseOrder = () => {
    // Navigate to purchase order form with quotation data
    navigate(`/purchase-order-form?from-quotation=${quotation.id}`);
  };

  const handleUpdateStatus = async (newStatus: QuotationStatus) => {
    try {
      await updateQuotation(quotation.id, { status: newStatus });
      toast({
        title: "Status Updated",
        description: `Quotation ${quotation.quotationNumber} is now ${newStatus}.`
      });
      // Refresh the page to show the updated status
      window.location.reload();
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: "Failed to update status. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteQuotation(quotation.id);
      toast({
        title: "Quotation Deleted",
        description: `Quotation ${quotation.quotationNumber} has been deleted.`
      });
      // Refresh the page to show the updated list
      window.location.reload();
    } catch (error) {
      console.error("Error deleting quotation:", error);
      toast({
        title: "Error",
        description: "Failed to delete quotation. Please try again.",
        variant: "destructive"
      });
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
