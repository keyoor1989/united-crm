import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Search, Filter, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { InventoryItem, Brand, Model } from "@/types/inventory";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ItemSelectorProps {
  onItemSelect: (item: InventoryItem) => void;
  brands: Brand[];
  models: Model[];
  items: InventoryItem[];
  warehouseId: string | null;
}

const ItemSelector = ({
  onItemSelect,
  brands,
  models,
  items,
  warehouseId,
}: ItemSelectorProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"name" | "quantity">("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const { data: inventoryItems = [], isLoading: isLoadingInventoryItems } = useQuery({
    queryKey: ['inventoryItems', warehouseId],
    queryFn: async () => {
      let query = supabase
        .from('opening_stock_entries')
        .select('*');
      
      if (warehouseId) {
        query = query.eq('warehouse_id', warehouseId);
      }
      
      const { data, error } = await query.order('part_name');
      
      if (error) {
        throw new Error(error.message);
      }
      
      return data.map(item => ({
        id: item.id,
        modelId: "", // Not available directly
        brandId: "", // Not available directly  
        name: item.part_name,
        type: item.category,
        minQuantity: item.min_stock,
        currentQuantity: item.quantity,
        lastPurchasePrice: item.purchase_price,
        lastVendor: "", // Not available
        barcode: item.part_number || "",
        createdAt: item.created_at
      })) as InventoryItem[];
    },
    enabled: true
  });

  const itemTypes = React.useMemo(() => {
    const types = new Set<string>();
    inventoryItems.forEach((item) => types.add(item.type));
    return Array.from(types).sort();
  }, [inventoryItems]);

  const filteredItems = React.useMemo(() => {
    let result = [...inventoryItems];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.type.toLowerCase().includes(query) ||
          (item.barcode && item.barcode.toLowerCase().includes(query))
      );
    }

    if (selectedBrand) {
      result = result.filter((item) => item.brandId === selectedBrand);
    }

    if (selectedType) {
      result = result.filter((item) => item.type === selectedType);
    }

    result.sort((a, b) => {
      if (sortBy === "name") {
        return sortDirection === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else {
        return sortDirection === "asc"
          ? a.currentQuantity - b.currentQuantity
          : b.currentQuantity - a.currentQuantity;
      }
    });

    return result;
  }, [inventoryItems, searchQuery, selectedBrand, selectedType, sortBy, sortDirection]);

  useEffect(() => {
    setSelectedItem(null);
  }, [searchQuery, selectedBrand, selectedType]);

  const handleItemSelect = (itemId: string) => {
    setSelectedItem(itemId);
    const item = inventoryItems.find((i) => i.id === itemId);
    if (item) {
      onItemSelect(item);
    }
  };

  const handleSort = (field: "name" | "quantity") => {
    if (sortBy === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortDirection("asc");
    }
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedBrand(null);
    setSelectedType(null);
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="col-span-1 md:col-span-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by name or barcode..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Select
                value={selectedType || undefined}
                onValueChange={(value) => setSelectedType(value || null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Item Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_types">All Types</SelectItem>
                  {itemTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleClearFilters}
              >
                <Filter className="mr-2 h-4 w-4" />
                Clear Filters
              </Button>
            </div>
          </div>

          {isLoadingInventoryItems ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Select</TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort("name")}>
                      Item Name
                      {sortBy === "name" && (
                        <ArrowUpDown className="ml-1 h-4 w-4 inline" />
                      )}
                    </TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort("quantity")}>
                      Stock
                      {sortBy === "quantity" && (
                        <ArrowUpDown className="ml-1 h-4 w-4 inline" />
                      )}
                    </TableHead>
                    <TableHead>Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4">
                        No items found. Try adjusting your filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredItems.map((item) => (
                      <TableRow 
                        key={item.id} 
                        className={selectedItem === item.id ? "bg-muted" : ""}
                        onClick={() => handleItemSelect(item.id)}
                      >
                        <TableCell>
                          <RadioGroup value={selectedItem || ""}>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem
                                value={item.id}
                                id={`item-${item.id}`}
                                checked={selectedItem === item.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleItemSelect(item.id);
                                }}
                              />
                            </div>
                          </RadioGroup>
                        </TableCell>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.type}</TableCell>
                        <TableCell>
                          <span className={item.currentQuantity < item.minQuantity ? "text-destructive" : "text-green-600"}>
                            {item.currentQuantity}
                          </span>{" "}
                          <span className="text-muted-foreground">
                            (Min: {item.minQuantity})
                          </span>
                        </TableCell>
                        <TableCell>₹{item.lastPurchasePrice}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ItemSelector;
