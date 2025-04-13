
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Vendor } from "@/types/inventory";
import { useToast } from "@/components/ui/use-toast";

// Define the context shape
interface VendorContextValue {
  vendors: Vendor[];
  addVendor: (vendor: Omit<Vendor, "id" | "createdAt">) => Promise<void>;
  updateVendor: (vendor: Vendor) => Promise<void>;
  deleteVendor: (id: string) => Promise<void>;
  loading: boolean;
}

// Create the context
const VendorContext = createContext<VendorContextValue | undefined>(undefined);

// Provider component
export const VendorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch vendors on component mount
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('vendors')
          .select('*')
          .order('name');

        if (error) {
          throw error;
        }

        // Transform vendor data to match our Vendor type
        const formattedVendors: Vendor[] = data.map((vendor) => ({
          id: vendor.id,
          name: vendor.name,
          contactPerson: vendor.contact_person || '',
          email: vendor.email || '',
          phone: vendor.phone || '',
          address: vendor.address || '',
          gstNo: vendor.gst_no || '',
          createdAt: vendor.created_at
        }));

        setVendors(formattedVendors);
      } catch (error) {
        console.error('Error fetching vendors:', error);
        toast({
          title: "Error",
          description: "Failed to load vendors. Please refresh the page.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchVendors();
  }, [toast]);

  // Add a new vendor
  const addVendor = async (vendorData: Omit<Vendor, "id" | "createdAt">) => {
    try {
      // Convert to DB format
      const { data, error } = await supabase
        .from('vendors')
        .insert({
          name: vendorData.name,
          contact_person: vendorData.contactPerson,
          email: vendorData.email,
          phone: vendorData.phone,
          address: vendorData.address,
          gst_no: vendorData.gstNo
        })
        .select();

      if (error) {
        throw error;
      }

      // Add the new vendor to state
      if (data && data.length > 0) {
        const newVendor: Vendor = {
          id: data[0].id,
          name: data[0].name,
          contactPerson: data[0].contact_person || '',
          email: data[0].email || '',
          phone: data[0].phone || '',
          address: data[0].address || '',
          gstNo: data[0].gst_no || '',
          createdAt: data[0].created_at
        };
        
        setVendors((prev) => [...prev, newVendor]);
        toast({
          title: "Success",
          description: "Vendor added successfully.",
        });
      }
    } catch (error) {
      console.error('Error adding vendor:', error);
      toast({
        title: "Error",
        description: "Failed to add vendor. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Update an existing vendor
  const updateVendor = async (vendor: Vendor) => {
    try {
      const { error } = await supabase
        .from('vendors')
        .update({
          name: vendor.name,
          contact_person: vendor.contactPerson,
          email: vendor.email,
          phone: vendor.phone,
          address: vendor.address,
          gst_no: vendor.gstNo
        })
        .eq('id', vendor.id);

      if (error) {
        throw error;
      }

      // Update the vendor in state
      setVendors((prev) =>
        prev.map((v) => (v.id === vendor.id ? vendor : v))
      );

      toast({
        title: "Success",
        description: "Vendor updated successfully.",
      });
    } catch (error) {
      console.error('Error updating vendor:', error);
      toast({
        title: "Error",
        description: "Failed to update vendor. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Delete a vendor
  const deleteVendor = async (id: string) => {
    try {
      const { error } = await supabase
        .from('vendors')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      // Remove the vendor from state
      setVendors((prev) => prev.filter((v) => v.id !== id));

      toast({
        title: "Success",
        description: "Vendor deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting vendor:', error);
      toast({
        title: "Error",
        description: "Failed to delete vendor. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <VendorContext.Provider
      value={{
        vendors,
        addVendor,
        updateVendor,
        deleteVendor,
        loading,
      }}
    >
      {children}
    </VendorContext.Provider>
  );
};

// Custom hook to use the vendor context
export const useVendors = () => {
  const context = useContext(VendorContext);
  if (context === undefined) {
    throw new Error('useVendors must be used within a VendorProvider');
  }
  return context;
};
