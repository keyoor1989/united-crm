import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Vendor } from '@/types/inventory';
import { toast } from '@/hooks/use-toast';

interface VendorContextType {
  vendors: Vendor[];
  loading: boolean;
  error: Error | null;
  addVendor: (vendor: Omit<Vendor, 'id' | 'createdAt'>) => Promise<void>;
  updateVendor: (id: string, vendor: Partial<Vendor>) => Promise<void>;
  deleteVendor: (id: string) => Promise<void>;
  getVendorById: (id: string) => Vendor | undefined;
  refreshVendors: () => Promise<void>;
}

const VendorContext = createContext<VendorContextType | undefined>(undefined);

export const VendorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshCounter, setRefreshCounter] = useState(0);

  const fetchVendors = async () => {
    setLoading(true);
    try {
      console.log('Fetching vendors...');
      const { data, error } = await supabase.from('vendors').select('*');
      
      if (error) throw new Error(error.message);
      
      console.log('Vendors fetched:', data);
      
      const vendorsData: Vendor[] = (data || []).map(vendor => ({
        id: vendor.id,
        name: vendor.name,
        contactPerson: vendor.contact_person || '',
        email: vendor.email || '',
        phone: vendor.phone || '',
        address: vendor.address || '',
        gstNo: vendor.gst_no || '',
        createdAt: vendor.created_at || new Date().toISOString()
      }));
      
      setVendors(vendorsData);
    } catch (err) {
      console.error('Error fetching vendors:', err);
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, [refreshCounter]);

  const refreshVendors = async () => {
    setRefreshCounter(prev => prev + 1);
  };

  const addVendor = async (vendor: Omit<Vendor, 'id' | 'createdAt'>) => {
    try {
      console.log('Adding new vendor:', vendor);
      const { data, error } = await supabase.from('vendors').insert({
        name: vendor.name,
        contact_person: vendor.contactPerson || '',
        email: vendor.email || '',
        phone: vendor.phone || '',
        address: vendor.address || '',
        gst_no: vendor.gstNo || '',
      }).select();
      
      if (error) throw new Error(error.message);
      
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
        
        setVendors([...vendors, newVendor]);
        toast({
          title: "Vendor added",
          description: "The vendor has been added successfully."
        });
        
        console.log('Vendor added successfully:', newVendor);
      }
    } catch (err) {
      console.error('Error adding vendor:', err);
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      toast({
        title: "Failed to add vendor",
        description: "There was an error adding the vendor.",
        variant: "destructive",
      });
    }
  };

  const updateVendor = async (id: string, updates: Partial<Vendor>) => {
    try {
      console.log('Updating vendor:', id, updates);
      const updateData: Record<string, any> = {};
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.contactPerson !== undefined) updateData.contact_person = updates.contactPerson;
      if (updates.email !== undefined) updateData.email = updates.email;
      if (updates.phone !== undefined) updateData.phone = updates.phone;
      if (updates.address !== undefined) updateData.address = updates.address;
      if (updates.gstNo !== undefined) updateData.gst_no = updates.gstNo;
      
      const { error } = await supabase.from('vendors').update(updateData).eq('id', id);
      
      if (error) throw new Error(error.message);
      
      setVendors(vendors.map(vendor => {
        if (vendor.id === id) {
          return { ...vendor, ...updates };
        }
        return vendor;
      }));
      
      toast({
        title: "Vendor updated",
        description: "The vendor has been updated successfully."
      });
      
      console.log('Vendor updated successfully');
    } catch (err) {
      console.error('Error updating vendor:', err);
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      toast({
        title: "Failed to update vendor",
        description: "There was an error updating the vendor.",
        variant: "destructive",
      });
    }
  };

  const deleteVendor = async (id: string) => {
    try {
      console.log('Deleting vendor:', id);
      const { error } = await supabase.from('vendors').delete().eq('id', id);
      
      if (error) throw new Error(error.message);
      
      setVendors(vendors.filter(vendor => vendor.id !== id));
      
      toast({
        title: "Vendor deleted",
        description: "The vendor has been deleted successfully."
      });
      
      console.log('Vendor deleted successfully');
    } catch (err) {
      console.error('Error deleting vendor:', err);
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      toast({
        title: "Failed to delete",
        description: "There was an error deleting the vendor.",
        variant: "destructive",
      });
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
      getVendorById,
      refreshVendors
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
