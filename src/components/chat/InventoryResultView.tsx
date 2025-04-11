
import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Package, AlertTriangle, ShoppingCart, FileText, Search } from "lucide-react";
import { ParsedInventoryQuery, getStockStatusEmoji, getStockStatusText, findSimilarItems } from "@/utils/chatCommands/inventoryParser";
import { InventoryItem } from "@/types/inventory";
import { toast } from "sonner";
import { format } from "date-fns";

interface InventoryResultViewProps {
  queryResult: ParsedInventoryQuery;
}

const InventoryResultView: React.FC<InventoryResultViewProps> = ({ queryResult }) => {
  const handleIssueItem = (item: Partial<InventoryItem>) => {
    toast.info(`Feature coming soon: Issue ${item.name}`);
  };

  const handleCreatePO = (item: Partial<InventoryItem>) => {
    toast.info(`Feature coming soon: Create PO for ${item.name}`);
  };

  const handleViewInventory = () => {
    // In a real app, this would navigate to the inventory page
    window.location.href = "/inventory";
  };

  return (
    <div className="space-y-4">
      {queryResult.matchedItems.length > 0 ? (
        <>
          <p>Here are the inventory results:</p>
          
          <div className="space-y-3">
            {queryResult.matchedItems.map((item) => {
              const statusEmoji = getStockStatusEmoji(item);
              const { text: statusText, color: statusColor } = getStockStatusText(item);
              
              return (
                <Card key={item.id} className="p-3 border-l-4" style={{ borderLeftColor: statusColor === "text-green-600" ? "#22c55e" : statusColor === "text-amber-600" ? "#f59e0b" : "#dc2626" }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold">{item.name}</span>
                    </div>
                    <Badge variant={statusText === "In Stock" ? "success" : statusText === "Low Stock" ? "warning" : "destructive"}>
                      {statusText}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm mb-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Quantity:</span>
                      <span className={statusColor}>
                        {statusEmoji} {item.currentQuantity !== undefined ? item.currentQuantity : "N/A"} pcs
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Min. Level:</span>
                      <span>{item.minQuantity || "N/A"} pcs</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last Price:</span>
                      <span>₹{item.lastPurchasePrice?.toLocaleString() || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Supplier:</span>
                      <span>{item.lastVendor || "N/A"}</span>
                    </div>
                  </div>
                  
                  {item.currentQuantity !== undefined && item.currentQuantity < (item.minQuantity || 0) && (
                    <div className="flex items-center gap-2 bg-amber-50 text-amber-800 p-2 rounded-md text-sm mb-3">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      <p>Stock below minimum level. Consider creating a purchase order.</p>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleIssueItem(item)}>
                      Issue Item
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleCreatePO(item)}>
                      Create PO
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
          
          <div className="text-xs text-muted-foreground">
            Stock last updated: {format(queryResult.lastUpdated, 'dd MMM yyyy, HH:mm')}
          </div>
        </>
      ) : (
        <div className="space-y-4">
          <p>No inventory items found matching your query.</p>
          
          {queryResult.brand || queryResult.model || queryResult.itemType ? (
            <div className="bg-muted p-3 rounded-md text-sm">
              <p className="font-medium mb-2">Search criteria:</p>
              <ul className="list-disc pl-5 space-y-1">
                {queryResult.brand && <li>Brand: {queryResult.brand}</li>}
                {queryResult.model && <li>Model: {queryResult.model}</li>}
                {queryResult.itemType && <li>Type: {queryResult.itemType}</li>}
              </ul>
            </div>
          ) : null}
          
          {/* Show similar items suggestions */}
          {queryResult.query && (
            <div className="space-y-2">
              <p className="font-medium">You might be looking for:</p>
              {findSimilarItems(queryResult.query).map((item, index) => (
                <div key={index} className="bg-accent p-2 rounded-md text-sm flex items-center justify-between">
                  <span>{item.name}</span>
                  <Button variant="ghost" size="sm" className="h-7 gap-1">
                    <Search className="h-3 w-3" />
                    <span>Check</span>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      <div className="pt-2">
        <Button onClick={handleViewInventory} className="w-full">
          <FileText className="h-4 w-4 mr-2" />
          View Complete Inventory
        </Button>
      </div>
    </div>
  );
};

export default InventoryResultView;
