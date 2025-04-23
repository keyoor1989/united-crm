
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Column {
  key: string;
  header: string;
  cell?: (row: any) => React.ReactNode;
}

interface EntryTableProps {
  columns: Column[];
  data: any[];
  onAdd?: () => void;
  onEdit?: (item: any) => void;
  onDelete?: (item: any) => void;
  addButtonText?: string;
  isLoading?: boolean; // Added isLoading prop
}

const EntryTable: React.FC<EntryTableProps> = ({
  columns,
  data,
  onAdd,
  onEdit,
  onDelete,
  addButtonText = "Add Entry",
  isLoading = false // Default to false
}) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Entries</h2>
        {onAdd && (
          <Button onClick={onAdd}>
            {addButtonText}
          </Button>
        )}
      </div>
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.key}>{column.header}</TableHead>
              ))}
              {(onEdit || onDelete) && <TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length + (onEdit || onDelete ? 1 : 0)} className="text-center py-8">
                  Loading entries...
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + (onEdit || onDelete ? 1 : 0)} className="text-center py-8">
                  No entries found
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, index) => (
                <TableRow key={index}>
                  {columns.map((column) => (
                    <TableCell key={column.key}>
                      {column.cell ? column.cell(row) : row[column.key]}
                    </TableCell>
                  ))}
                  {(onEdit || onDelete) && (
                    <TableCell>
                      <div className="flex gap-2">
                        {onEdit && (
                          <Button variant="outline" size="sm" onClick={() => onEdit(row)}>
                            Edit
                          </Button>
                        )}
                        {onDelete && (
                          <Button variant="destructive" size="sm" onClick={() => onDelete(row)}>
                            Delete
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default EntryTable;
