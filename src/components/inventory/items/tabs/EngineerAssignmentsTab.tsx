
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEngineerAssignmentHistory } from '@/hooks/inventory/useEngineerAssignmentHistory';
import { format } from 'date-fns';

interface EngineerAssignmentsTabProps {
  itemName: string | null;
}

export const EngineerAssignmentsTab = ({ itemName }: EngineerAssignmentsTabProps) => {
  const { data: engineerAssignments } = useEngineerAssignmentHistory(itemName);

  const formatDate = (date: string) => {
    if (!date) return 'N/A';
    try {
      return format(new Date(date), 'dd MMM yyyy');
    } catch (e) {
      return date || 'N/A';
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Engineer</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Warehouse</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {engineerAssignments && engineerAssignments.length > 0 ? (
              engineerAssignments.map((assignment) => (
                <TableRow key={assignment.id}>
                  <TableCell>{formatDate(assignment.assigned_date)}</TableCell>
                  <TableCell>{assignment.engineer_name}</TableCell>
                  <TableCell>{assignment.quantity}</TableCell>
                  <TableCell>{assignment.warehouse_source}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                  No engineer assignments found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
