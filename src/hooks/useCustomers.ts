
import { useState, useEffect } from "react";
import { CustomerType } from "@/types/customer";

// Sample customer data
const customerData: CustomerType[] = [
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

// Get customers from localStorage or use sample data if none exist
const getStoredCustomers = (): CustomerType[] => {
  try {
    const storedCustomers = localStorage.getItem("customers");
    if (storedCustomers) {
      const parsedCustomers = JSON.parse(storedCustomers);
      return Array.isArray(parsedCustomers) ? parsedCustomers : customerData;
    }
  } catch (error) {
    console.error("Error reading customers from localStorage:", error);
  }
  
  // Initialize localStorage with sample data if empty
  localStorage.setItem("customers", JSON.stringify(customerData));
  return customerData;
};

export const useCustomers = () => {
  const [customers, setCustomers] = useState<CustomerType[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [locationFilter, setLocationFilter] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const itemsPerPage = 5;

  useEffect(() => {
    setCustomers(getStoredCustomers());
  }, []);

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

  const uniqueLocations = Array.from(new Set(customers.map(c => c.location)));
  const uniqueStatuses = Array.from(new Set(customers.map(c => c.status)));

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCustomers.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter(null);
    setLocationFilter(null);
    setCurrentPage(1);
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  return {
    customers: currentItems,
    filteredCustomers,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    locationFilter,
    setLocationFilter,
    currentPage,
    totalPages,
    handlePageChange,
    resetFilters,
    showFilters,
    toggleFilters,
    uniqueLocations,
    uniqueStatuses,
  };
};
