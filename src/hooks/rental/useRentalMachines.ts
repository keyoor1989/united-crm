
import { useState, useEffect } from 'react';
import { RentalMachine } from '@/types/finance';
import { toast } from 'sonner';

export const useRentalMachines = () => {
  const [machines, setMachines] = useState<RentalMachine[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Filter machines based on search query
  const filteredMachines = machines.filter(machine => 
    machine.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    machine.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
    machine.clientName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleGenerateBilling = (machine: RentalMachine) => {
    toast.info(`Generating billing for ${machine.model} (${machine.serialNumber})`);
  };

  const handlePrintContract = (machine: RentalMachine) => {
    toast.info(`Preparing to print contract for ${machine.model} (${machine.serialNumber})`);
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
    handlePrintContract
  };
};
