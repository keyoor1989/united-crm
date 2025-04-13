
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Vendor } from '@/types/inventory';
import { toast } from 'sonner';
import { dbAdapter } from '@/types/inventory';

interface VendorContextType {
  vendors: Vendor[];
  loading: boolean;
  error: Error | null;
  addVendor: (vendor: Omit<Vendor, 'id' | 'createdAt'>) => Promise<void>;
  updateVendor: (id: string, vendor: Partial<Vendor>) => Promise<void>;
  deleteVendor: (id: string) => Promise<void>;
  getVendorById: (id: string) => Vendor | undefined;
}

const VendorContext = createContext<VendorContextType | undefined>(undefined);

export const VendorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchVendors = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.from('vendors').select('*');
        
        if (error) throw new Error(error.message);
        
        // Convert snake_case to camelCase using the adapter
        const vendorsData: Vendor[] = (data || []).map(vendor => dbAdapter.adaptVendor(vendor));
        
        setVendors(vendorsData);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error occurred'));
        console.error('Error fetching vendors:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVendors();
  }, []);

  const addVendor = async (vendor: Omit<Vendor, 'id' | 'createdAt'>) => {
    try {
      // Convert camelCase to snake_case for database
      const { data, error } = await supabase.from('vendors').insert({
        name: vendor.name,
        contact_person: vendor.contactPerson || '',
        email: vendor.email,
        phone: vendor.phone,
        address: vendor.address,
        gst_no: vendor.gstNo || '',
      }).select();
      
      if (error) throw new Error(error.message);
      
      if (data && data.length > 0) {
        // Use our adapter to convert from DB format to frontend format
        const newVendor = dbAdapter.adaptVendor(data[0]);
        
        setVendors([...vendors, newVendor]);
        toast.success('Vendor added successfully');
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      console.error('Error adding vendor:', err);
      toast.error('Failed to add vendor');
    }
  };

  const updateVendor = async (id: string, updates: Partial<Vendor>) => {
    try {
      // Convert camelCase to snake_case for database
      const updateData: Record<string, any> = {};
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.contactPerson !== undefined) updateData.contact_person = updates.contactPerson;
      if (updates.email !== undefined) updateData.email = updates.email;
      if (updates.phone !== undefined) updateData.phone = updates.phone;
      if (updates.address !== undefined) updateData.address = updates.address;
      if (updates.gstNo !== undefined) updateData.gst_no = updates.gstNo;
      
      const { error } = await supabase.from('vendors').update(updateData).eq('id', id);
      
      if (error) throw new Error(error.message);
      
      // Update local state
      setVendors(vendors.map(vendor => {
        if (vendor.id === id) {
          return { ...vendor, ...updates };
        }
        return vendor;
      }));
      
      toast.success('Vendor updated successfully');
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      console.error('Error updating vendor:', err);
      toast.error('Failed to update vendor');
    }
  };

  const deleteVendor = async (id: string) => {
    try {
      const { error } = await supabase.from('vendors').delete().eq('id', id);
      
      if (error) throw new Error(error.message);
      
      // Update local state
      setVendors(vendors.filter(vendor => vendor.id !== id));
      
      toast.success('Vendor deleted successfully');
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      console.error('Error deleting vendor:', err);
      toast.error('Failed to delete vendor');
    }
  };

  const getVendorById = (id: string) => {
    return vendors.find(vendor => vendor.id === id);
  };

  return (
    <VendorContext.Provider value={{ 
      vendors, 
      loading, 
      error, 
      addVendor, 
      updateVendor, 
      deleteVendor,
      getVendorById
    }}>
      {children}
    </VendorContext.Provider>
  );
};

export const useVendors = () => {
  const context = useContext(VendorContext);
  if (context === undefined) {
    throw new Error('useVendors must be used within a VendorProvider');
  }
  return context;
};
