
import React from "react";
import { Package, Move } from "lucide-react";
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Warehouse } from "@/types/inventory";

interface WarehouseTransferTableProps {
  transfers: any[];
  warehouses: Warehouse[];
  loading: boolean;
  emptyMessage?: string;
}

const getWarehouseName = (warehouses: Warehouse[], id: string) =>
  warehouses.find(w => w.id === id)?.name || id;
const getWarehouseLocation = (warehouses: Warehouse[], id: string) =>
  warehouses.find(w => w.id === id)?.location || "";

const WarehouseTransferTable = ({
  transfers,
  warehouses,
  loading,
  emptyMessage = "No records",
}: WarehouseTransferTableProps) => (
  <ScrollArea className="w-full h-[400px]">
    <Table>
      <TableHeader className="sticky top-0 bg-background z-10">
        <TableRow>
          <TableHead>Transfer ID</TableHead>
          <TableHead>Item</TableHead>
          <TableHead>Quantity</TableHead>
          <TableHead>Source Warehouse</TableHead>
          <TableHead>Destination Warehouse</TableHead>
          <TableHead>Request Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Method</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading && (
          <TableRow>
            <TableCell colSpan={8} className="text-center">Loading...</TableCell>
          </TableRow>
        )}
        {!loading && transfers.map((transfer) => (
          <TableRow key={transfer.id}>
            <TableCell className="font-medium">{transfer.id.slice(0, 8)}</TableCell>
            <TableCell>
              <div className="flex gap-2 items-center">
                <Package className="h-4 w-4" />
                {transfer.item ? (
                  <>
                    {transfer.item.part_name}
                    <span className="text-xs text-muted-foreground ml-1">
                      {transfer.item.brand}
                      {transfer.item.part_number && ` (${transfer.item.part_number})`}
                    </span>
                  </>
                ) : (
                  "Item not found"
                )}
              </div>
            </TableCell>
            <TableCell>{transfer.quantity}</TableCell>
            <TableCell>
              <div className="flex items-center gap-1.5">
                <Move className="h-4 w-4" />
                {getWarehouseName(warehouses, transfer.source_warehouse_id)}
                {getWarehouseLocation(warehouses, transfer.source_warehouse_id) && (
                  <span className="ml-2 text-xs text-muted-foreground">{getWarehouseLocation(warehouses, transfer.source_warehouse_id)}</span>
                )}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1.5">
                <Move className="h-4 w-4" />
                {getWarehouseName(warehouses, transfer.destination_warehouse_id)}
                {getWarehouseLocation(warehouses, transfer.destination_warehouse_id) && (
                  <span className="ml-2 text-xs text-muted-foreground">{getWarehouseLocation(warehouses, transfer.destination_warehouse_id)}</span>
                )}
              </div>
            </TableCell>
            <TableCell>
              {transfer.request_date ? new Date(transfer.request_date).toLocaleDateString() : "-"}
            </TableCell>
            <TableCell>
              <span className="rounded px-2 py-1 text-xs bg-muted">{transfer.status}</span>
            </TableCell>
            <TableCell>{transfer.transfer_method || "-"}</TableCell>
          </TableRow>
        ))}
        {!loading && transfers.length === 0 && (
          <TableRow>
            <TableCell colSpan={8} className="h-24 text-center">{emptyMessage}</TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  </ScrollArea>
);

export default WarehouseTransferTable;
