
import React, { useMemo } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, PieController } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { SalesItem } from '@/components/inventory/sales/SalesTable';

// Register ChartJS components
ChartJS.register(ArcElement, PieController, Tooltip, Legend);

interface PaymentMethodChartProps {
  salesData: SalesItem[];
}

export const PaymentMethodChart: React.FC<PaymentMethodChartProps> = ({ salesData }) => {
  // Process the data to group by payment method
  const chartData = useMemo(() => {
    // Skip processing if data is empty
    if (!salesData || salesData.length === 0) {
      return {
        labels: [],
        datasets: [
          {
            label: 'No data available',
            data: [],
            backgroundColor: [],
            borderColor: [],
            borderWidth: 1,
          }
        ]
      };
    }
    
    // Group sales by payment method
    const salesByMethod = salesData.reduce((acc, sale) => {
      const method = sale.paymentMethod || 'Unknown';
      
      if (!acc[method]) {
        acc[method] = {
          count: 0,
          revenue: 0
        };
      }
      
      acc[method].count += 1;
      acc[method].revenue += sale.total;
      
      return acc;
    }, {} as Record<string, { count: number, revenue: number }>);
    
    // Prepare colors
    const backgroundColors = [
      'rgba(255, 99, 132, 0.6)',
      'rgba(54, 162, 235, 0.6)',
      'rgba(255, 206, 86, 0.6)',
      'rgba(75, 192, 192, 0.6)',
      'rgba(153, 102, 255, 0.6)',
      'rgba(255, 159, 64, 0.6)',
      'rgba(199, 199, 199, 0.6)'
    ];
    
    const borderColors = [
      'rgba(255, 99, 132, 1)',
      'rgba(54, 162, 235, 1)',
      'rgba(255, 206, 86, 1)',
      'rgba(75, 192, 192, 1)',
      'rgba(153, 102, 255, 1)',
      'rgba(255, 159, 64, 1)',
      'rgba(199, 199, 199, 1)'
    ];
    
    const methods = Object.keys(salesByMethod);
    
    return {
      labels: methods,
      datasets: [
        {
          label: 'Sales by Payment Method',
          data: methods.map(method => salesByMethod[method].count),
          backgroundColor: backgroundColors.slice(0, methods.length),
          borderColor: borderColors.slice(0, methods.length),
          borderWidth: 1,
        }
      ]
    };
  }, [salesData]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} sales (${percentage}%)`;
          }
        }
      }
    }
  };

  return (
    <div className="w-full h-full">
      {salesData && salesData.length > 0 ? (
        <Pie data={chartData} options={options} />
      ) : (
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">No sales data available</p>
        </div>
      )}
    </div>
  );
};
