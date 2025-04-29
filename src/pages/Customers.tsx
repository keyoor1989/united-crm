
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import CustomerTable from "@/components/customers/CustomerTable";
import CustomerFilters from "@/components/customers/CustomerFilters";
import CustomerPagination from "@/components/customers/CustomerPagination";
import { useCustomers } from "@/hooks/useCustomers";

const Customers = () => {
  const { toast } = useToast();
  const {
    customers,
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
    isLoading,
  } = useCustomers();

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
    const cleanPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanPhone}`, '_blank');
    toast({
      title: "WhatsApp Customer",
      description: `Opening WhatsApp chat`,
    });
  };

  const onResetFilters = () => {
    resetFilters();
    toast({
      title: "Filters Reset",
      description: "All filters have been cleared",
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground">
            Manage your customer relationships and follow-ups
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/customers/follow-ups">
            <Button variant="outline" className="gap-1">
              <Calendar className="h-4 w-4" />
              Follow-ups
            </Button>
          </Link>
          <Link to="/customer">
            <Button className="gap-1 bg-brand-500 hover:bg-brand-600">
              <Plus className="h-4 w-4" />
              Add Customer
            </Button>
          </Link>
        </div>
      </div>
      
      <CustomerFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        locationFilter={locationFilter}
        onLocationFilterChange={setLocationFilter}
        onResetFilters={onResetFilters}
        showFilters={showFilters}
        onToggleFilters={toggleFilters}
        uniqueStatuses={uniqueStatuses}
        uniqueLocations={uniqueLocations}
      />

      <div className="rounded-md border shadow-sm bg-white overflow-x-auto">
        <CustomerTable
          customers={customers}
          onCall={handleCall}
          onEmail={handleEmail}
          onWhatsApp={handleWhatsApp}
          isLoading={isLoading}
        />
        
        {filteredCustomers.length > 5 && (
          <CustomerPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  );
};

export default Customers;
