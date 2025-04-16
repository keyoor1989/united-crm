
import React from "react";
import { Helmet } from "react-helmet";
import { Card, CardContent } from "@/components/ui/card";
import { CashPurchaseHeader } from "@/components/inventory/purchases/CashPurchaseHeader";
import { CashPurchaseForm } from "@/components/inventory/purchases/CashPurchaseForm";
import { useCashPurchase } from "@/hooks/inventory/useCashPurchase";
import { Loader2 } from "lucide-react";

const CashPurchase = () => {
  const {
    purchaseDate,
    setPurchaseDate,
    categories,
    isLoading,
    saveCashPurchase,
  } = useCashPurchase();

  return (
    <div className="container mx-auto py-6">
      <Helmet>
        <title>Cash Purchase | Inventory Management</title>
      </Helmet>

      <CashPurchaseHeader 
        date={purchaseDate} 
        onDateChange={setPurchaseDate} 
      />

      <Card>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
              <span>Processing purchase...</span>
            </div>
          ) : (
            <CashPurchaseForm
              onSave={saveCashPurchase}
              categories={categories}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CashPurchase;
