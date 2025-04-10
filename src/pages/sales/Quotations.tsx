
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
  PlusCircle, Search, FileText, MoreHorizontal, 
  Eye, Edit, Trash, FileDown, Copy 
} from "lucide-react";
import { quotations } from "@/data/salesData";
import { Quotation, QuotationStatus } from "@/types/sales";
import { format } from "date-fns";
import { generateQuotationPdf } from "@/utils/pdfGenerator";
import { useToast } from "@/hooks/use-toast";

const Quotations = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<QuotationStatus | "All">("All");
  const { toast } = useToast();
  
  // Filter quotations based on search term and status
  const filteredQuotations = quotations.filter(quotation => {
    const matchesSearch = 
      quotation.quotationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quotation.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "All" || quotation.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  // Handle PDF generation
  const handleDownloadPdf = (quotation: Quotation) => {
    try {
      generateQuotationPdf(quotation);
      toast({
        title: "PDF Generated",
        description: `Quotation ${quotation.quotationNumber} PDF has been downloaded.`,
      });
    } catch (error) {
      console.error("PDF generation error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "There was an error generating the PDF. Please try again.",
      });
    }
  };
  
  // Get status badge color based on status
  const getStatusBadge = (status: QuotationStatus) => {
    switch (status) {
      case "Draft":
        return <Badge variant="outline">Draft</Badge>;
      case "Sent":
        return <Badge variant="secondary">Sent</Badge>;
      case "Accepted":
        return <Badge variant="success" className="bg-green-500 hover:bg-green-600">Accepted</Badge>;
      case "Rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      case "Expired":
        return <Badge variant="outline" className="border-amber-500 text-amber-500">Expired</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
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
            <h1 className="text-2xl font-bold tracking-tight">Quotations</h1>
            <p className="text-muted-foreground">
              Manage and track sales quotations for your customers.
            </p>
          </div>
        </div>
        <Button 
          onClick={() => navigate("/quotation-form")}
          className="flex items-center gap-1"
        >
          <PlusCircle className="h-4 w-4" />
          New Quotation
        </Button>
      </div>
      
      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search quotations..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button 
            variant={statusFilter === "All" ? "default" : "outline"} 
            onClick={() => setStatusFilter("All")}
          >
            All
          </Button>
          <Button 
            variant={statusFilter === "Draft" ? "default" : "outline"} 
            onClick={() => setStatusFilter("Draft")}
          >
            Draft
          </Button>
          <Button 
            variant={statusFilter === "Sent" ? "default" : "outline"} 
            onClick={() => setStatusFilter("Sent")}
          >
            Sent
          </Button>
          <Button 
            variant={statusFilter === "Accepted" ? "default" : "outline"} 
            onClick={() => setStatusFilter("Accepted")}
          >
            Accepted
          </Button>
        </div>
      </div>
      
      {/* Quotations table */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Quotation #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
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
                    {getStatusBadge(quotation.status)}
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
                        <DropdownMenuItem
                          onClick={() => navigate(`/quotation-form/${quotation.id}`)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDownloadPdf(quotation)}>
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
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  <FileText className="h-10 w-10 mx-auto mb-2 opacity-20" />
                  <p>No quotations found</p>
                  <Button 
                    variant="link" 
                    onClick={() => navigate("/quotation-form")} 
                    className="mt-2"
                  >
                    Create your first quotation
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

export default Quotations;
