
import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Search, 
  Plus, 
  FilterX, 
  Filter,
  MoreVertical,
  Phone,
  Mail,
  MessageSquare,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

// Customer type definition
type CustomerStatus = "Active" | "Contract Renewal" | "Need Toner" | "Inactive" | "Prospect";

interface Customer {
  id: number;
  name: string;
  lastContact: string;
  phone: string;
  email: string;
  location: string;
  machines: string[];
  status: CustomerStatus;
}

// Mock customer data
const customerData: Customer[] = [
  {
    id: 1,
    name: "Govt. Medical College",
    lastContact: "5 days ago",
    phone: "9876543210",
    email: "admin@gmch.in",
    location: "Indore",
    machines: ["Kyocera 2554ci", "Canon IR2520", "Xerox B215"],
    status: "Contract Renewal"
  },
  {
    id: 2,
    name: "Sunrise Hospital",
    lastContact: "2 days ago",
    phone: "8765432109",
    email: "admin@sunrise.co.in",
    location: "Bhopal",
    machines: ["Xerox 7845", "Kyocera 2040"],
    status: "Active"
  },
  {
    id: 3,
    name: "Rajesh Enterprises",
    lastContact: "Today",
    phone: "7654321098",
    email: "info@rajeshent.com",
    location: "Jabalpur",
    machines: ["Ricoh MP2014"],
    status: "Need Toner"
  },
  {
    id: 4,
    name: "Apex Technologies",
    lastContact: "1 week ago",
    phone: "9988776655",
    email: "contact@apextech.com",
    location: "Indore",
    machines: ["HP LaserJet Pro M428", "Kyocera M2640"],
    status: "Active"
  },
  {
    id: 5,
    name: "City Hospital",
    lastContact: "3 days ago",
    phone: "8877665544",
    email: "info@cityhospital.org",
    location: "Gwalior",
    machines: ["Canon iR3225", "Kyocera P3045"],
    status: "Inactive"
  },
  {
    id: 6,
    name: "Star College",
    lastContact: "Yesterday",
    phone: "7766554433",
    email: "admin@starcollege.edu",
    location: "Ujjain",
    machines: ["Ricoh SP3600", "Xerox Phaser 3330"],
    status: "Contract Renewal"
  },
  {
    id: 7,
    name: "Modern Office Supplies",
    lastContact: "4 days ago",
    phone: "6655443322",
    email: "sales@modernoffice.com",
    location: "Indore",
    machines: ["HP M402n", "Canon LBP214dw", "Ricoh M320F"],
    status: "Active"
  },
  {
    id: 8,
    name: "Lakshmi Industries",
    lastContact: "1 month ago",
    phone: "9977553311",
    email: "info@lakshmind.co.in",
    location: "Ratlam",
    machines: ["Kyocera TASKalfa 3253ci"],
    status: "Prospect"
  },
];

const Customers = () => {
  const { toast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [locationFilter, setLocationFilter] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Initialize with mock data
  useEffect(() => {
    setCustomers(customerData);
  }, []);

  // Filter customers based on search term and filters
  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch = 
      searchTerm === "" || 
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm);
    
    const matchesStatus = 
      !statusFilter || 
      customer.status === statusFilter;
    
    const matchesLocation = 
      !locationFilter || 
      customer.location === locationFilter;
    
    return matchesSearch && matchesStatus && matchesLocation;
  });

  // Get unique locations for filter dropdown
  const uniqueLocations = Array.from(new Set(customers.map(c => c.location)));
  
  // Get unique statuses for filter dropdown
  const uniqueStatuses = Array.from(new Set(customers.map(c => c.status)));

  // Pagination
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCustomers.slice(indexOfFirstItem, indexOfLastItem);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter(null);
    setLocationFilter(null);
    setCurrentPage(1);
    toast({
      title: "Filters Reset",
      description: "All filters have been cleared",
    });
  };

  // Show filter dropdown
  const [showFilters, setShowFilters] = useState(false);

  // Handle action buttons functionality
  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
    toast({
      title: "Calling Customer",
      description: `Dialing ${phone}`,
    });
  };

  const handleEmail = (email: string) => {
    window.location.href = `mailto:${email}`;
    toast({
      title: "Email Customer",
      description: `Opening email to ${email}`,
    });
  };

  const handleWhatsApp = (phone: string) => {
    // Remove any non-numeric characters
    const cleanPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanPhone}`, '_blank');
    toast({
      title: "WhatsApp Customer",
      description: `Opening WhatsApp chat`,
    });
  };

  // Status badge color mapping
  const getStatusColor = (status: CustomerStatus) => {
    switch(status) {
      case "Active": return "bg-green-500";
      case "Contract Renewal": return "bg-amber-500";
      case "Need Toner": return "bg-blue-500";
      case "Inactive": return "bg-gray-500";
      case "Prospect": return "bg-purple-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
            <p className="text-muted-foreground">
              Manage your customer relationships and follow-ups
            </p>
          </div>
          <Link to="/customer-form">
            <Button className="gap-1">
              <Plus className="h-4 w-4" />
              Add Customer
            </Button>
          </Link>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search customers..."
              className="pl-8 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-2 self-end">
            <Button variant="outline" className="gap-1" onClick={resetFilters}>
              <FilterX className="h-4 w-4" />
              <span className="hidden sm:inline">Reset</span>
            </Button>
            <Button 
              variant="outline" 
              className="gap-1"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Filter</span>
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-md">
            <div>
              <label className="text-sm font-medium mb-1 block">Status</label>
              <Select value={statusFilter || ""} onValueChange={(value) => setStatusFilter(value || null)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  {uniqueStatuses.map((status) => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Location</label>
              <Select value={locationFilter || ""} onValueChange={(value) => setLocationFilter(value || null)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Locations</SelectItem>
                  {uniqueLocations.map((location) => (
                    <SelectItem key={location} value={location}>{location}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        <div className="rounded-md border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead className="hidden md:table-cell">Location</TableHead>
                <TableHead className="hidden lg:table-cell">Machines</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No customers found matching your filters.
                  </TableCell>
                </TableRow>
              ) : (
                currentItems.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">
                      {customer.name}
                      <div className="text-xs text-muted-foreground">Last contact: {customer.lastContact}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          <span>{customer.phone}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          <span>{customer.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{customer.location}</TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex gap-1 flex-wrap">
                        {customer.machines.length > 1 ? (
                          <>
                            <Badge variant="outline" className="bg-slate-50">{customer.machines[0]}</Badge>
                            <Badge variant="outline" className="bg-slate-50">+{customer.machines.length - 1} more</Badge>
                          </>
                        ) : (
                          <Badge variant="outline" className="bg-slate-50">{customer.machines[0]}</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(customer.status)}>{customer.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          title="Call"
                          onClick={() => handleCall(customer.phone)}
                        >
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          title="Email"
                          onClick={() => handleEmail(customer.email)}
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          title="WhatsApp"
                          onClick={() => handleWhatsApp(customer.phone)}
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <DropdownMenuItem>Machine History</DropdownMenuItem>
                            <DropdownMenuItem>Create Quotation</DropdownMenuItem>
                            <DropdownMenuItem>Schedule Service</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              Delete Customer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          
          {filteredCustomers.length > itemsPerPage && (
            <div className="p-4 border-t">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => handlePageChange(currentPage > 1 ? currentPage - 1 : 1)}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => handlePageChange(page)}
                        isActive={currentPage === page}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => handlePageChange(currentPage < totalPages ? currentPage + 1 : totalPages)}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Customers;
