
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/utils/finance/financeUtils";
import { Payment } from "@/types/finance";

interface PaymentSummaryCardsProps {
  entries: Payment[];
}

const PaymentSummaryCards: React.FC<PaymentSummaryCardsProps> = ({ entries }) => {
  const customerTotal = entries
    .filter(entry => entry.entityType === "Customer")
    .reduce((sum, entry) => sum + Number(entry.amount), 0);

  const dealerTotal = entries
    .filter(entry => entry.entityType === "Dealer")
    .reduce((sum, entry) => sum + Number(entry.amount), 0);
    
  const rentalTotal = entries
    .filter(entry => entry.entityType === "Rental")
    .reduce((sum, entry) => sum + Number(entry.amount), 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Customer Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(customerTotal)}</div>
          <p className="text-xs text-muted-foreground">
            {entries.filter(e => e.entityType === "Customer").length} payments received
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Dealer Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(dealerTotal)}</div>
          <p className="text-xs text-muted-foreground">
            {entries.filter(e => e.entityType === "Dealer").length} payments made
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Rental Income</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(rentalTotal)}</div>
          <p className="text-xs text-muted-foreground">
            {entries.filter(e => e.entityType === "Rental").length} rental payments
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSummaryCards;
