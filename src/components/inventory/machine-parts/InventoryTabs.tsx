
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import MachinePartsTable from "./MachinePartsTable";
import LowStockTable from "./LowStockTable";
import PartsFilters from "./PartsFilters";
import { InventoryItem } from "@/types/inventory";

interface InventoryTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedBrand: string;
  setSelectedBrand: (brand: string) => void;
  categories: string[];
  brands: string[];
  filteredItems: InventoryItem[];
  isLoading: boolean;
  error: Error | null;
  onDeleteItem: (item: InventoryItem) => void;
  onViewHistory: (item: InventoryItem) => void;
}

const InventoryTabs: React.FC<InventoryTabsProps> = ({
  activeTab,
  setActiveTab,
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  selectedBrand,
  setSelectedBrand,
  categories,
  brands,
  filteredItems,
  isLoading,
  error,
  onDeleteItem,
  onViewHistory,
}) => {
  return (
    <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <div className="flex justify-between items-center">
        <TabsList>
          <TabsTrigger value="all">All Parts</TabsTrigger>
          <TabsTrigger value="low_stock">Low Stock</TabsTrigger>
        </TabsList>
        <PartsFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedBrand={selectedBrand}
          setSelectedBrand={setSelectedBrand}
          categories={categories}
          brands={brands}
        />
      </div>

      <TabsContent value="all" className="space-y-4">
        <Card>
          <CardContent className="p-0">
            <MachinePartsTable
              items={filteredItems}
              isLoading={isLoading}
              error={error}
              onDeleteItem={onDeleteItem}
              onViewHistory={onViewHistory}
            />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="low_stock" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Low Stock Items</CardTitle>
            <CardDescription>
              Items that are below their minimum stock level and need to be reordered
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <LowStockTable
              items={filteredItems}
              isLoading={isLoading}
              error={error}
            />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default InventoryTabs;
