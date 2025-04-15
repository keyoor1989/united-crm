import React, { useState, useEffect } from "react";
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
  Eye, FileDown, Send, CheckCircle, XCircle, Copy, Loader2 
} from "lucide-react";
import { generateQuotationPdf } from "@/utils/pdf/quotationPdfGenerator";
import { format } from "date-fns";
import { toast } from "sonner";
import { fetchQuotations } from "@/services/quotationService";
import { Quotation } from "@/types/sales";
import { safeGeneratePdf } from "@/utils/pdfGenerator";

const SentQuotations = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const getQuotations = async () => {
      try {
        setIsLoading(true);
        const data = await fetchQuotations();
        setQuotations(data);
      } catch (error) {
        console.error("Error fetching quotations:", error);
        toast.error("Failed to load quotations");
      } finally {
        setIsLoading(false);
      }
    };
    
    getQuotations();
  }, []);
  
  const filteredQuotations = quotations
    .filter(q => q.status === "Sent")
    .filter(quotation => 
      quotation.quotationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quotation.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  
  const handleDownloadPdf = (quotation: Quotation) => {
    try {
      const quotationCopy = JSON.parse(JSON.stringify(quotation));
      
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
  
  if (isLoading) {
    return (
      <div className="container mx-auto py-6 flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-2 text-muted-foreground">Loading quotations...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <img 
            src="/lovable-uploads/01eb2522-9319-4441-8cce-7f1a4ed92ed8.png" 
            alt="United Copier" 
            className="h-12 w-auto" 
          />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Sent Quotations</h1>
            <p className="text-muted-foreground">
              Track and manage quotations that have been sent to customers
            </p>
          </div>
        </div>
        <Button 
          onClick={() => navigate("/quotation-form")}
          variant="outline"
        >
          New Quotation
        </Button>
      </div>
      
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
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                  <p className="mt-2 text-muted-foreground">Loading quotations...</p>
                </TableCell>
              </TableRow>
            ) : filteredQuotations.length > 0 ? (
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
