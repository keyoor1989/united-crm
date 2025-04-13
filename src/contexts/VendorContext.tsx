
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Vendor } from '@/types/sales';
import { toast } from '@/components/ui/use-toast';

interface VendorContextType {
  vendors: Vendor[];
  loading: boolean;
  error: Error | null;
  addVendor: (vendor: Omit<Vendor, 'id' | 'created_at'>) => Promise<Vendor | null>;
  updateVendor: (id: string, updates: Partial<Vendor>) => Promise<boolean>;
  deleteVendor: (id: string) => Promise<boolean>;
  refreshVendors: () => Promise<void>;
}

const VendorContext = createContext<VendorContextType | undefined>(undefined);

export function useVendors() {
  const context = useContext(VendorContext);
  if (context === undefined) {
    throw new Error('useVendors must be used within a VendorProvider');
  }
  return context;
}

export const VendorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .order('name');

      if (error) throw error;
      
      // Map the data to match our Vendor type
      const mappedVendors: Vendor[] = data.map(vendor => ({
        id: vendor.id,
        name: vendor.name,
        contactPerson: vendor.contact_person || '',
        email: vendor.email || '',
        phone: vendor.phone || '',
        address: vendor.address || '',
      }));
      
      setVendors(mappedVendors);
    } catch (err: any) {
      setError(err);
      toast({
        title: 'Error fetching vendors',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const addVendor = async (vendor: Omit<Vendor, 'id' | 'created_at'>): Promise<Vendor | null> => {
    try {
      // Convert from our app's format to database format
      const dbVendor = {
        name: vendor.name,
        contact_person: vendor.contactPerson,
        email: vendor.email,
        phone: vendor.phone,
        address: vendor.address,
      };

      const { data, error } = await supabase
        .from('vendors')
        .insert(dbVendor)
        .select()
        .single();

      if (error) throw error;

      // Convert back to our app's format
      const newVendor: Vendor = {
        id: data.id,
        name: data.name,
        contactPerson: data.contact_person || '',
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || '',
      };

      setVendors(prev => [...prev, newVendor]);
      toast({
        title: 'Vendor added',
        description: `${vendor.name} has been added successfully.`,
      });
      
      return newVendor;
    } catch (err: any) {
      toast({
        title: 'Error adding vendor',
        description: err.message,
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateVendor = async (id: string, updates: Partial<Vendor>): Promise<boolean> => {
    try {
      // Convert from our app's format to database format
      const dbUpdates: any = {};
      if (updates.name) dbUpdates.name = updates.name;
      if (updates.contactPerson !== undefined) dbUpdates.contact_person = updates.contactPerson;
      if (updates.email !== undefined) dbUpdates.email = updates.email;
      if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
      if (updates.address !== undefined) dbUpdates.address = updates.address;

      const { error } = await supabase
        .from('vendors')
        .update(dbUpdates)
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setVendors(prev => prev.map(vendor => 
        vendor.id === id ? { ...vendor, ...updates } : vendor
      ));
      
      toast({
        title: 'Vendor updated',
        description: 'Vendor information has been updated successfully.',
      });
      
      return true;
    } catch (err: any) {
      toast({
        title: 'Error updating vendor',
        description: err.message,
        variant: 'destructive',
      });
      return false;
    }
  };

  const deleteVendor = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('vendors')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setVendors(prev => prev.filter(vendor => vendor.id !== id));
      
      toast({
        title: 'Vendor deleted',
        description: 'Vendor has been deleted successfully.',
      });
      
      return true;
    } catch (err: any) {
      toast({
        title: 'Error deleting vendor',
        description: err.message,
        variant: 'destructive',
      });
      return false;
    }
  };

  const refreshVendors = async (): Promise<void> => {
    await fetchVendors();
  };

  const value = {
    vendors,
    loading,
    error,
    addVendor,
    updateVendor,
    deleteVendor,
    refreshVendors,
  };

  return <VendorContext.Provider value={value}>{children}</VendorContext.Provider>;
};
