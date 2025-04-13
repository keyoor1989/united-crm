
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileText, FilePlus, Filter, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { fetchQuotations } from "@/services/quotationService";
import { useToast } from "@/components/ui/use-toast";
import QuotationTable from "@/components/sales/quotations/QuotationTable";

const Quotations = () => {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadQuotations = async () => {
      try {
        setLoading(true);
        const data = await fetchQuotations();
        setQuotations(data);
      } catch (error) {
        console.error("Error loading quotations:", error);
        toast({
          title: "Error",
          description: "Failed to load quotations. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadQuotations();
  }, [toast]);

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Quotations</h1>
          <p className="text-muted-foreground">
            View and manage all quotations
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button asChild>
            <Link to="/quotation-form">
              <FilePlus className="h-4 w-4 mr-2" />
              Create New Quotation
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Quotations</CardTitle>
          <CardDescription>
            Manage your customer quotations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
              <span>Loading quotations...</span>
            </div>
          ) : quotations.length > 0 ? (
            <QuotationTable quotations={quotations} />
          ) : (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 mx-auto text-muted-foreground opacity-50" />
              <h3 className="mt-4 text-lg font-semibold">No Quotations Yet</h3>
              <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
                Start by creating your first quotation to keep track of customer opportunities.
              </p>
              <Button asChild className="mt-6">
                <Link to="/quotation-form">
                  <FilePlus className="h-4 w-4 mr-2" />
                  Create New Quotation
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Quotations;
