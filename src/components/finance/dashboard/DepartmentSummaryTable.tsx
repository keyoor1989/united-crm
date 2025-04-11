
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DepartmentSummary } from "@/types/finance";

interface DepartmentSummaryTableProps {
  departmentData: DepartmentSummary[];
  formatCurrency: (amount: number) => string;
}

const DepartmentSummaryTable: React.FC<DepartmentSummaryTableProps> = ({ departmentData, formatCurrency }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Department-wise Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Department</TableHead>
              <TableHead>Revenue</TableHead>
              <TableHead>Expenses</TableHead>
              <TableHead>Profit</TableHead>
              <TableHead>Profit Margin</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {departmentData.map((dept) => (
              <TableRow key={dept.name}>
                <TableCell>{dept.name}</TableCell>
                <TableCell>{formatCurrency(dept.revenue)}</TableCell>
                <TableCell>{formatCurrency(dept.expenses)}</TableCell>
                <TableCell className={dept.profit >= 0 ? "text-green-600" : "text-red-600"}>
                  {formatCurrency(dept.profit)}
                </TableCell>
                <TableCell>
                  {dept.revenue === 0 ? (
                    <Badge variant="destructive">N/A</Badge>
                  ) : (
                    <Badge variant={dept.profit >= 0 ? "default" : "destructive"}>
                      {((dept.profit / dept.revenue) * 100).toFixed(1)}%
                    </Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default React.memo(DepartmentSummaryTable);
