import React, { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Edit, Trash2, Plus, History } from "lucide-react";
import { toast } from "sonner";
import InventoryFormModal from "./InventoryFormModal";
import DeleteConfirmationDialog from "./DeleteConfirmationDialog";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useInventoryItems, useDeleteInventoryItem } from "@/hooks/inventory/useInventoryItems";
import { InventoryItem } from "@/types/inventory";
import ItemHistoryDialog from "./ItemHistoryDialog";

interface InventoryTableProps {
  searchQuery?: string;
  categoryFilter?: string;
  locationFilter?: string;
  onAddNew?: () => void;
}

const InventoryTable = ({ 
  searchQuery = '', 
  categoryFilter = 'all', 
  locationFilter = 'all',
  onAddNew
}: InventoryTableProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedItemForHistory, setSelectedItemForHistory] = useState<InventoryItem | null>(null);
  const { items, isLoading } = useInventoryItems(null);
  const { mutate: deleteItem } = useDeleteInventoryItem();
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string, name: string } | null>(null);
  
  const handleEditItem = (item: any) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleAddItem = () => {
    setSelectedItem(null);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id: string, name: string) => {
    setItemToDelete({ id, name });
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteItem = (id: string) => {
    deleteItem(id);
  };

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case "Out of Stock":
        return "destructive";
      case "Low Stock":
        return "warning";
      case "In Stock":
        return "success";
      default:
        return "secondary";
    }
  };
  
  const getInventoryStatus = (item: InventoryItem): string => {
    if (item.quantity <= 0) return "Out of Stock";
    if (item.quantity < item.min_stock) return "Low Stock";
    return "In Stock";
  };
  
  const filteredItems = useMemo(() => {
    if (!items) return [];
    
    return items.filter(item => {
      const matchesSearch = searchQuery === '' || 
        (item.name && item.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.part_name && item.part_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.part_number && item.part_number.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = categoryFilter === 'all' || 
        (item.category && item.category.toLowerCase() === categoryFilter.toLowerCase());
      
      const matchesLocation = locationFilter === 'all' || 
        (item.location && item.location.toLowerCase().includes(locationFilter.toLowerCase()));
      
      return matchesSearch && matchesCategory && matchesLocation;
    });
  }, [searchQuery, categoryFilter, locationFilter, items]);
  
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categoryFilter, locationFilter]);
  
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const actionButtons = (item: InventoryItem) => (
    <div className="flex justify-end gap-2">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => setSelectedItemForHistory(item)}
        title="View Item History"
      >
        <History className="h-4 w-4" />
      </Button>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => handleEditItem(item)}
        title="Edit Item"
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => handleDeleteClick(item.id, item.part_name || item.name)}
        title="Delete Item"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-semibold">Inventory Items</h2>
          {filteredItems.length > 0 ? (
            <p className="text-sm text-muted-foreground">
              Showing {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
              {searchQuery || categoryFilter !== 'all' || locationFilter !== 'all' ? ' (filtered)' : ''}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              {isLoading ? "Loading items..." : "No items found"}
            </p>
          )}
        </div>
        <Button onClick={onAddNew || handleAddItem} className="flex items-center gap-1">
          <Plus className="h-4 w-4" />
          <span>Add New Item</span>
        </Button>
      </div>
      
      <div className="rounded-md border bg-card">
        <Table>
          <TableCaption>
            {isLoading ? 'Loading inventory items...' : 
              filteredItems.length === 0 ? 
                'No inventory items found matching your criteria.' : 
                'A list of your inventory items.'}
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Product Name</TableHead>
              <TableHead>SKU/Part Number</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Brand & Models</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  Loading inventory items...
                </TableCell>
              </TableRow>
            ) : currentItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  No results found. Try adjusting your filters.
                </TableCell>
              </TableRow>
            ) : (
              currentItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    {item.part_name || item.name}
                  </TableCell>
                  <TableCell>{item.part_number || "N/A"}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>
                    {item.brand ? (
                      <div>
                        <span className="font-medium">{item.brand}</span>
                        {item.compatible_models && item.compatible_models.length > 0 && (
                          <div className="text-sm text-muted-foreground">
                            {Array.isArray(item.compatible_models) 
                              ? item.compatible_models.slice(0, 2).join(', ') + 
                                (item.compatible_models.length > 2 ? '...' : '')
                              : item.compatible_models}
                          </div>
                        )}
                      </div>
                    ) : (
                      "N/A"
                    )}
                  </TableCell>
                  <TableCell className="text-right">₹{item.purchase_price ? item.purchase_price.toLocaleString() : "N/A"}</TableCell>
                  <TableCell>
                    <Badge variant={getBadgeVariant(getInventoryStatus(item)) as any}>
                      {getInventoryStatus(item)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {actionButtons(item)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {filteredItems.length > 0 && (
        <div className="mt-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              
              {Array.from({ length: totalPages }).map((_, index) => {
                const pageNumber = index + 1;
                const showPage = pageNumber === 1 || 
                                pageNumber === totalPages || 
                                (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1);
                
                if (!showPage) {
                  if (pageNumber === 2 || pageNumber === totalPages - 1) {
                    return (
                      <PaginationItem key={`ellipsis-${pageNumber}`}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    );
                  }
                  return null;
                }
                
                return (
                  <PaginationItem key={pageNumber}>
                    <PaginationLink
                      isActive={pageNumber === currentPage}
                      onClick={() => handlePageChange(pageNumber)}
                    >
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      <InventoryFormModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen} 
        itemToEdit={selectedItem} 
      />

      {itemToDelete && (
        <DeleteConfirmationDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          itemId={itemToDelete.id}
          itemName={itemToDelete.name}
          onConfirmDelete={handleDeleteItem}
        />
      )}

      {selectedItemForHistory && (
        <ItemHistoryDialog
          open={!!selectedItemForHistory}
          onOpenChange={(open) => !open && setSelectedItemForHistory(null)}
          item={selectedItemForHistory}
        />
      )}
    </>
  );
};

export default InventoryTable;
