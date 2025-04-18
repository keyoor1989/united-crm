
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface WarehouseStockInfoProps {
  itemName: string;
}

export const WarehouseStockInfo = ({ itemName }: WarehouseStockInfoProps) => {
  const { data: warehouseStock, isLoading } = useQuery({
    queryKey: ['warehouse_stock', itemName],
    queryFn: async () => {
      if (!itemName) return [];
      
      const { data: stockData, error } = await supabase
        .from('opening_stock_entries')
        .select('warehouse_name, quantity')
        .eq('part_name', itemName);
        
      if (error) {
        console.error('Error fetching warehouse stock:', error);
        return [];
      }
      
      return stockData || [];
    },
    enabled: !!itemName
  });

  if (isLoading || !warehouseStock || warehouseStock.length === 0) return null;

  return (
    <div className="mt-2 text-sm">
      <p className="text-muted-foreground mb-1">Available Stock:</p>
      <div className="space-y-1">
        {warehouseStock.map((stock, index) => (
          <div key={index} className="flex justify-between">
            <span>{stock.warehouse_name || 'Main Warehouse'}</span>
            <span className="font-medium">{stock.quantity} units</span>
          </div>
        ))}
      </div>
    </div>
  );
};
