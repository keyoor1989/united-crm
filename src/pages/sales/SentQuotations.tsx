
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { 
  Search, MoreHorizontal, 
  Eye, FileDown, Send, CheckCircle, XCircle, Copy 
} from "lucide-react";
import { quotations } from "@/data/salesData";
import { QuotationStatus } from "@/types/sales";
import { format } from "date-fns";
import { generateQuotationPdf } from "@/utils/pdfGenerator";
import { useToast } from "@/hooks/use-toast";

const SentQuotations = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  
  // Filter only sent quotations
  const filteredQuotations = quotations
    .filter(q => q.status === "Sent")
    .filter(quotation => 
      quotation.quotationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quotation.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  
  // Handle PDF download
  const handleDownloadPdf = (quotation: typeof quotations[0]) => {
    try {
      generateQuotationPdf(quotation);
      toast({
        title: "PDF Generated",
        description: `Quotation ${quotation.quotationNumber} has been downloaded.`,
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
      });
    }
  };
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Sent Quotations</h1>
          <p className="text-muted-foreground">
            Track and manage quotations that have been sent to customers
          </p>
        </div>
        <Button 
          onClick={() => navigate("/quotation-form")}
          variant="outline"
        >
          New Quotation
        </Button>
      </div>
      
      {/* Search bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search sent quotations..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {/* Quotations table */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Quotation #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Sent Date</TableHead>
              <TableHead>Valid Until</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredQuotations.length > 0 ? (
              filteredQuotations.map((quotation) => (
                <TableRow key={quotation.id}>
                  <TableCell className="font-medium">
                    {quotation.quotationNumber}
                  </TableCell>
                  <TableCell>{quotation.customerName}</TableCell>
                  <TableCell>
                    {format(new Date(quotation.createdAt), "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell>
                    {format(new Date(quotation.validUntil), "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell className="font-medium">
                    ₹{quotation.grandTotal.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">Sent</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => navigate(`/quotation-form/${quotation.id}`)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Send className="mr-2 h-4 w-4" />
                          Resend Email
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDownloadPdf(quotation)}>
                          <FileDown className="mr-2 h-4 w-4" />
                          Download PDF
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Mark as Accepted
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <XCircle className="mr-2 h-4 w-4" />
                          Mark as Rejected
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="mr-2 h-4 w-4" />
                          Create Purchase Order
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  <p>No sent quotations found</p>
                  <Button 
                    variant="link" 
                    onClick={() => navigate("/quotation-form")} 
                    className="mt-2"
                  >
                    Create a new quotation
                  </Button>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default SentQuotations;
