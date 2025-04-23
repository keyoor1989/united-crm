
import { useState, useEffect, useCallback } from 'react';
import { RentalMachine } from '@/types/finance';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

export const useRentalMachines = () => {
  const [machines, setMachines] = useState<RentalMachine[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  // Filter machines based on search query
  const filteredMachines = machines.filter(machine => 
    machine.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    machine.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
    machine.clientName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Fetch rental machines from database
  const fetchRentalMachines = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('amc_machines')
        .select('*, amc_contracts(*)');
      
      if (error) {
        throw error;
      }

      if (data) {
        // Map the database schema to our frontend RentalMachine type
        const mappedMachines: RentalMachine[] = data.map(machine => ({
          id: machine.id,
          serialNumber: machine.serial_number,
          model: machine.model,
          clientName: machine.customer_name,
          clientId: machine.customer_id,
          location: machine.location,
          startDate: machine.start_date,
          endDate: machine.end_date,
          monthlyRent: machine.current_rent,
          copyLimitA4: machine.copy_limit_a4,
          copyLimitA3: machine.copy_limit_a3,
          currentA4Reading: machine.last_a4_reading || 0,
          currentA3Reading: machine.last_a3_reading || 0,
          lastReadingDate: machine.last_reading_date || new Date().toISOString(),
          status: machine.contract_id ? 'Active' : 'Inactive',
          contractId: machine.contract_id,
          customerId: machine.customer_id,
          department: machine.department || '',
        }));
        
        setMachines(mappedMachines);
      }
    } catch (err) {
      console.error('Error fetching rental machines:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while fetching rental machines');
      toast.error('Failed to load rental machines');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRentalMachines();
  }, [fetchRentalMachines]);

  const handleGenerateBilling = async (machine: RentalMachine) => {
    try {
      // Generate billing implementation - will be implemented in future
      toast.info(`Generating billing for ${machine.model} (${machine.serialNumber})`);
    } catch (err) {
      console.error('Error generating billing:', err);
      toast.error('Failed to generate billing');
    }
  };

  const handlePrintContract = async (machine: RentalMachine) => {
    try {
      // Print contract implementation - will be implemented in future
      toast.info(`Preparing to print contract for ${machine.model} (${machine.serialNumber})`);
    } catch (err) {
      console.error('Error printing contract:', err);
      toast.error('Failed to print contract');
    }
  };

  const addRentalParts = async (
    machine: RentalMachine,
    partData: {
      partName: string;
      quantity: number;
      cost: number;
      reading?: { a4: number; a3: number };
      date: Date;
      notes?: string;
    }
  ) => {
    try {
      // Add rental parts to database
      const { partName, quantity, cost, reading, date, notes } = partData;
      
      // Format the date as a string in ISO format
      const formattedDate = format(date, 'yyyy-MM-dd');
      
      // 1. Insert into amc_consumable_usage
      const { error: usageError } = await supabase
        .from('amc_consumable_usage')
        .insert({
          machine_model: machine.model,
          machine_type: 'Copier', // Default - can be replaced with actual machine type if available
          serial_number: machine.serialNumber,
          contract_id: machine.contractId,
          machine_id: machine.id,
          customer_id: machine.customerId,
          customer_name: machine.clientName,
          item_name: partName,
          quantity,
          cost,
          department: machine.department,
          remarks: notes,
          date: formattedDate,
        });
      
      if (usageError) throw usageError;
      
      // 2. Update machine readings if provided
      if (reading) {
        const { error: updateError } = await supabase
          .from('amc_machines')
          .update({
            last_a4_reading: reading.a4,
            last_a3_reading: reading.a3,
            last_reading_date: formattedDate
          })
          .eq('id', machine.id);
        
        if (updateError) throw updateError;
        
        // Update local state to reflect the new readings
        setMachines(prev => 
          prev.map(m => 
            m.id === machine.id 
              ? { 
                  ...m, 
                  currentA4Reading: reading.a4,
                  currentA3Reading: reading.a3,
                  lastReadingDate: formattedDate
                } 
              : m
          )
        );
      }
      
      toast.success(`Parts added for ${machine.model} (${machine.serialNumber})`);
      return true;
    } catch (err) {
      console.error('Error adding rental parts:', err);
      toast.error('Failed to add parts');
      return false;
    }
  };

  const addRentalMachine = async (machineData: any) => {
    try {
      await supabase.from('amc_machines').insert(machineData);
      await fetchRentalMachines(); // Refresh the list after adding
      return true;
    } catch (err) {
      console.error('Error adding rental machine:', err);
      toast.error('Failed to add rental machine');
      return false;
    }
  };

  const updateMachineReading = async (machineId: string, readingData: any) => {
    try {
      await supabase.from('amc_machines').update(readingData).eq('id', machineId);
      await fetchRentalMachines(); // Refresh the list after updating
      return true;
    } catch (err) {
      console.error('Error updating machine reading:', err);
      toast.error('Failed to update reading');
      return false;
    }
  };

  return {
    machines,
    setMachines,
    isLoading,
    setIsLoading,
    searchQuery,
    setSearchQuery,
    filteredMachines,
    handleGenerateBilling,
    handlePrintContract,
    error,
    addRentalParts,
    addRentalMachine,
    updateMachineReading,
    refreshData: fetchRentalMachines
  };
};
