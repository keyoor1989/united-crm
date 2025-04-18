
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Package } from "lucide-react";

interface EngineerAssignmentsTabProps {
  itemName: string | null;
}

export const EngineerAssignmentsTab = ({ itemName }: EngineerAssignmentsTabProps) => {
  const { data: engineerAssignments, isLoading } = useEngineerAssignmentHistory(itemName);

  const formatDate = (date: string) => {
    if (!date) return 'N/A';
    try {
      return format(new Date(date), 'dd MMM yyyy');
    } catch (e) {
      return date || 'N/A';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-3">
            <div className="flex space-x-4">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-1/4" />
            </div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex space-x-4">
                <Skeleton className="h-12 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

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
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {engineerAssignments && engineerAssignments.length > 0 ? (
              engineerAssignments.map((assignment) => (
                <TableRow key={assignment.id}>
                  <TableCell>{formatDate(assignment.assigned_date)}</TableCell>
                  <TableCell>{assignment.engineer_name}</TableCell>
                  <TableCell>{assignment.quantity}</TableCell>
                  <TableCell>{assignment.warehouse_source || 'Main'}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {assignment.model_number && (
                        <Badge variant="outline" className="w-fit">
                          Model: {assignment.model_number}
                        </Badge>
                      )}
                      {assignment.model_brand && (
                        <Badge variant="outline" className="w-fit">
                          Brand: {assignment.model_brand}
                        </Badge>
                      )}
                      {assignment.item_id && (
                        <Badge variant="outline" className="w-fit text-xs">
                          ID: {assignment.item_id}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                  <div className="flex flex-col items-center gap-2 py-4">
                    <Package className="h-10 w-10 text-muted-foreground/50" />
                    <span>No engineer assignments found</span>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
