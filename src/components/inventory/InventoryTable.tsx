
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
import { Package, Edit, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import InventoryFormModal from "./InventoryFormModal";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

// Sample inventory data
const inventoryItems = [
  {
    id: 1,
    name: "Kyocera 2554ci Toner Black",
    sku: "K-TN2554-BK",
    category: "Toner",
    quantity: 0,
    location: "Indore (HQ)",
    price: 4500,
    status: "Out of Stock"
  },
  {
    id: 2,
    name: "Ricoh MP2014 Drum Unit",
    sku: "R-DRM-MP2014",
    category: "Drum",
    quantity: 2,
    location: "Indore (HQ)",
    price: 3200,
    status: "Low Stock"
  },
  {
    id: 3,
    name: "Xerox 7845 Toner Cyan",
    sku: "X-TN7845-CY",
    category: "Toner",
    quantity: 1,
    location: "Bhopal Office",
    price: 5100,
    status: "Low Stock"
  },
  {
    id: 4,
    name: "Canon 2525 Drum Unit",
    sku: "C-DRM-2525",
    category: "Drum",
    quantity: 4,
    location: "Indore (HQ)",
    price: 4200,
    status: "In Stock"
  },
  {
    id: 5,
    name: "HP M428 Toner",
    sku: "HP-TN-M428",
    category: "Toner",
    quantity: 7,
    location: "Jabalpur Office",
    price: 2800,
    status: "In Stock"
  },
  {
    id: 6,
    name: "Sharp MX3070 Toner Black",
    sku: "SH-TN3070-BK",
    category: "Toner",
    quantity: 3,
    location: "Indore (HQ)",
    price: 5500,
    status: "In Stock"
  },
];

interface InventoryTableProps {
  searchQuery?: string;
  categoryFilter?: string;
  locationFilter?: string;
}

const InventoryTable = ({ 
  searchQuery = '', 
  categoryFilter = 'all', 
  locationFilter = 'all' 
}: InventoryTableProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  // Function to open modal for editing an item
  const handleEditItem = (item: any) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  // Function to open modal for adding a new item
  const handleAddItem = () => {
    setSelectedItem(null);
    setIsModalOpen(true);
  };

  // Function to handle deletion (would connect to API in real app)
  const handleDeleteItem = (id: number) => {
    // This would typically connect to an API or state management
    console.log(`Delete item with ID: ${id}`);
    toast.success("Item deleted successfully!");
  };

  // Function to get status badge color
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
  
  // Filter items based on search query and filters
  const filteredItems = useMemo(() => {
    return inventoryItems.filter(item => {
      // Search query filter
      const matchesSearch = searchQuery === '' || 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Category filter
      const matchesCategory = categoryFilter === 'all' || 
        item.category.toLowerCase() === categoryFilter.toLowerCase();
      
      // Location filter
      const matchesLocation = locationFilter === 'all' || 
        item.location.toLowerCase().includes(locationFilter.toLowerCase());
      
      return matchesSearch && matchesCategory && matchesLocation;
    });
  }, [searchQuery, categoryFilter, locationFilter]);
  
  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categoryFilter, locationFilter]);
  
  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  
  // Handle page navigation
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

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
            <p className="text-sm text-muted-foreground">No items found</p>
          )}
        </div>
        <Button onClick={handleAddItem} className="flex items-center gap-1">
          <Plus className="h-4 w-4" />
          <span>Add New Item</span>
        </Button>
      </div>
      
      <div className="rounded-md border bg-card">
        <Table>
          <TableCaption>
            {filteredItems.length === 0 ? 
              'No inventory items found matching your criteria.' : 
              'A list of your inventory items.'}
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Product Name</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Location</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentItems.length === 0 ? (
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
                    {item.name}
                  </TableCell>
                  <TableCell>{item.sku}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{item.location}</TableCell>
                  <TableCell className="text-right">₹{item.price.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={getBadgeVariant(item.status) as any}>
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEditItem(item)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteItem(item.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination - only show if we have items */}
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
    </>
  );
};

export default InventoryTable;
