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
  Trash2, CheckSquare, X, FileText 
} from "lucide-react";
import { PurchaseOrder, PurchaseOrderStatus } from "@/types/sales";
import { generatePurchaseOrderPdf } from "@/utils/pdf/purchaseOrderPdfGenerator";
import { updatePurchaseOrder, deletePurchaseOrder } from "@/services/purchaseOrderService";
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

interface PurchaseOrderActionsMenuProps {
  order: PurchaseOrder;
}

const PurchaseOrderActionsMenu: React.FC<PurchaseOrderActionsMenuProps> = ({ order }) => {
  const navigate = useNavigate();
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const { toast } = useToast();

  const handleViewDetails = () => {
    navigate(`/purchase-order/${order.id}`);
  };

  const handleEdit = () => {
    navigate(`/purchase-order-form/${order.id}`);
  };

  const handleDownloadPdf = () => {
    try {
      generatePurchaseOrderPdf(order);
      toast({
        title: "PDF Generated",
        description: `Purchase Order ${order.poNumber} has been downloaded.`
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

  const handleUpdateStatus = async (newStatus: PurchaseOrderStatus) => {
    try {
      await updatePurchaseOrder(order.id, { status: newStatus });
      toast({
        title: "Status Updated",
        description: `Purchase Order ${order.poNumber} is now ${newStatus}.`
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
      await deletePurchaseOrder(order.id);
      toast({
        title: "Purchase Order Deleted",
        description: `Purchase Order ${order.poNumber} has been deleted.`
      });
      // Refresh the page to show the updated list
      window.location.reload();
    } catch (error) {
      console.error("Error deleting purchase order:", error);
      toast({
        title: "Error",
        description: "Failed to delete purchase order. Please try again.",
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
          
          {order.status !== "Confirmed" && (
            <DropdownMenuItem onClick={() => handleUpdateStatus("Confirmed")}>
              <CheckSquare className="mr-2 h-4 w-4" />
              Mark as Confirmed
            </DropdownMenuItem>
          )}
          
          {order.status !== "Received" && (
            <DropdownMenuItem onClick={() => handleUpdateStatus("Received")}>
              <FileText className="mr-2 h-4 w-4" />
              Mark as Received
            </DropdownMenuItem>
          )}
          
          {order.status !== "Cancelled" && (
            <DropdownMenuItem onClick={() => handleUpdateStatus("Cancelled")}>
              <X className="mr-2 h-4 w-4" />
              Mark as Cancelled
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
              This will permanently delete Purchase Order {order.poNumber}. This action cannot be undone.
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

export default PurchaseOrderActionsMenu;
