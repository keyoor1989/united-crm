
import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { 
  MoreHorizontal, Eye, Send, FileDown, 
  CheckCircle, RefreshCw, TruckIcon 
} from "lucide-react";
import { PurchaseOrder } from "@/types/sales";
import { generatePurchaseOrderPdf } from "@/utils/pdf/purchaseOrderPdfGenerator";
import { toast } from "sonner";

interface SentOrderActionsMenuProps {
  order: PurchaseOrder;
}

const SentOrderActionsMenu: React.FC<SentOrderActionsMenuProps> = ({ order }) => {
  const navigate = useNavigate();

  const handleDownloadPdf = () => {
    try {
      // Create a proper deep copy to avoid reference issues
      const orderCopy = JSON.parse(JSON.stringify(order));
      
      // Ensure items is an array
      if (typeof orderCopy.items === 'string') {
        try {
          orderCopy.items = JSON.parse(orderCopy.items);
        } catch (e) {
          console.warn("Could not parse items as JSON, using empty array", e);
          orderCopy.items = [];
        }
      }
      
      if (!Array.isArray(orderCopy.items)) {
        console.warn("Items is not an array after processing, using empty array");
        orderCopy.items = [];
      }
      
      // Call the PDF generator
      generatePurchaseOrderPdf(orderCopy);
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
        <DropdownMenuItem>
          <Send className="mr-2 h-4 w-4" />
          Resend Email
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDownloadPdf}>
          <FileDown className="mr-2 h-4 w-4" />
          Download PDF
        </DropdownMenuItem>
        <DropdownMenuItem>
          <CheckCircle className="mr-2 h-4 w-4" />
          Mark as Confirmed
        </DropdownMenuItem>
        <DropdownMenuItem>
          <TruckIcon className="mr-2 h-4 w-4" />
          Mark as Received
        </DropdownMenuItem>
        <DropdownMenuItem>
          <RefreshCw className="mr-2 h-4 w-4" />
          Request Update
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SentOrderActionsMenu;
