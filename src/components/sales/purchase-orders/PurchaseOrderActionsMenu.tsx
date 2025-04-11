
import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { 
  MoreHorizontal, Eye, Edit, CheckCircle, 
  FileDown, Copy, Trash 
} from "lucide-react";
import { PurchaseOrder } from "@/types/sales";
import { generatePurchaseOrderPdf } from "@/utils/pdf/purchaseOrderPdfGenerator";
import { toast } from "sonner";

interface PurchaseOrderActionsMenuProps {
  order: PurchaseOrder;
}

const PurchaseOrderActionsMenu: React.FC<PurchaseOrderActionsMenuProps> = ({ order }) => {
  const navigate = useNavigate();

  const handleDownloadPdf = () => {
    try {
      generatePurchaseOrderPdf(order);
      toast.success("Purchase order PDF downloaded successfully");
    } catch (error) {
      console.error("Failed to download PDF:", error);
      toast.error("Failed to download PDF");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => navigate(`/purchase-order-form/${order.id}`)}
        >
          <Eye className="mr-2 h-4 w-4" />
          View Details
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => navigate(`/purchase-order-form/${order.id}`)}
        >
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>
        {order.status === "Sent" && (
          <DropdownMenuItem>
            <CheckCircle className="mr-2 h-4 w-4" />
            Mark as Confirmed
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={handleDownloadPdf}>
          <FileDown className="mr-2 h-4 w-4" />
          Download PDF
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Copy className="mr-2 h-4 w-4" />
          Duplicate
        </DropdownMenuItem>
        <DropdownMenuItem className="text-destructive">
          <Trash className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default PurchaseOrderActionsMenu;
