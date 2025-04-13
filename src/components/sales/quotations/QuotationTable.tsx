
import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell 
} from "@/components/ui/table";
import { format } from "date-fns";
import { Quotation } from "@/types/sales";
import QuotationStatusBadge from "./QuotationStatusBadge";
import QuotationActionsMenu from "./QuotationActionsMenu";

interface QuotationTableProps {
  quotations: Quotation[];
}

const QuotationTable: React.FC<QuotationTableProps> = ({ quotations }) => {
  const navigate = useNavigate();

  return (
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
          {quotations.map((quotation) => (
            <TableRow key={quotation.id}>
              <TableCell className="font-medium">
                {quotation.quotationNumber}
              </TableCell>
              <TableCell>{quotation.customerName}</TableCell>
              <TableCell>
                {format(new Date(quotation.createdAt), "MMM dd, yyyy")}
              </TableCell>
              <TableCell>
                {quotation.validUntil && format(new Date(quotation.validUntil), "MMM dd, yyyy")}
              </TableCell>
              <TableCell className="font-medium">
                ₹{quotation.grandTotal.toLocaleString()}
              </TableCell>
              <TableCell>
                <QuotationStatusBadge status={quotation.status} />
              </TableCell>
              <TableCell className="text-right">
                <QuotationActionsMenu quotation={quotation} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default QuotationTable;
