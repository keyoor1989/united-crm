
import React, { useEffect } from "react";
import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, ArrowRight } from "lucide-react";
import { toast } from "sonner";

const CreditSales = () => {
  const navigate = useNavigate();

  useEffect(() => {
    toast.info("Credit sales are now integrated into the main Sales page");
  }, []);

  return (
    <div className="space-y-6 p-6">
      <Helmet>
        <title>Credit Sales | Inventory</title>
      </Helmet>
      
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Credit Sales</h1>
          <p className="text-muted-foreground">
            Create and manage all credit sales
          </p>
        </div>
      </div>

      <Card className="border-dashed border-primary/50">
        <CardHeader>
          <CardTitle>Credit Sales Integration</CardTitle>
          <CardDescription>
            Credit sales are now integrated into the main Sales page
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            We've unified the sales experience to allow both regular and credit sales from a single interface.
            You can now create credit sales by selecting the "Credit" payment method in the main Sales page.
          </p>
          
          <div className="flex justify-center">
            <Button 
              onClick={() => navigate("/inventory/sales")}
              className="gap-2"
            >
              Go to Unified Sales
              <ArrowRight size={16} />
            </Button>
          </div>
          
          <div className="flex items-center justify-center p-4 bg-muted rounded-md">
            <div className="mr-4">
              <CreditCard size={36} className="text-primary" />
            </div>
            <div>
              <h3 className="font-medium">New Credit Sale</h3>
              <p className="text-sm text-muted-foreground">
                To create a new credit sale, go to Sales and select "Credit" as the payment method.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreditSales;
