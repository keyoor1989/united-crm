
import React from "react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";

interface Column<T> {
  key: string;
  title: string;
  cell?: (item: T) => React.ReactNode;
  className?: string;
  mobileRender?: boolean; // Whether to render this column in mobile view cards
}

interface MobileTableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  noResultsMessage?: string;
  onRowClick?: (item: T) => void;
  keyExtractor?: (item: T) => string | number;
}

export function MobileTable<T extends Record<string, any>>({
  data,
  columns,
  isLoading = false,
  noResultsMessage = "No data found",
  onRowClick,
  keyExtractor = (item: any, index: number) => index
}: MobileTableProps<T>) {
  const isMobile = useIsMobile();

  if (isLoading) {
    return (
      <div className="w-full text-center py-8">
        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="w-full text-center py-8">
        <p className="text-muted-foreground">{noResultsMessage}</p>
      </div>
    );
  }

  // Mobile card view
  if (isMobile) {
    return (
      <div className="space-y-4">
        {data.map((item, index) => {
          const key = typeof keyExtractor === "function" 
            ? keyExtractor(item) 
            : index;
            
          return (
            <Card 
              key={key} 
              className={cn(
                onRowClick && "cursor-pointer hover:bg-accent/50 transition-colors"
              )}
              onClick={() => onRowClick?.(item)}
            >
              <CardContent className="p-4 space-y-2">
                {columns
                  .filter(col => col.mobileRender !== false)
                  .map((column) => {
                    const value = column.cell 
                      ? column.cell(item) 
                      : item[column.key];
                    
                    return (
                      <div key={column.key} className="flex justify-between items-start">
                        <span className="text-sm font-medium text-muted-foreground">
                          {column.title}:
                        </span>
                        <span className="text-sm text-right">
                          {value}
                        </span>
                      </div>
                    );
                  })}
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  }

  // Desktop table view
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead 
                key={column.key}
                className={column.className}
              >
                {column.title}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, index) => {
            const key = typeof keyExtractor === "function" 
              ? keyExtractor(item) 
              : index;
              
            return (
              <TableRow 
                key={key}
                className={cn(onRowClick && "cursor-pointer")}
                onClick={() => onRowClick?.(item)}
              >
                {columns.map((column) => (
                  <TableCell key={column.key} className={column.className}>
                    {column.cell ? column.cell(item) : item[column.key]}
                  </TableCell>
                ))}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
