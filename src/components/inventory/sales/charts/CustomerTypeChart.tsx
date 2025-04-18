
import React, { useMemo } from 'react';
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  BarElement,
  BarController 
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { SalesItem } from '@/components/inventory/sales/SalesTable';

// Register ChartJS components
ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  BarController,
  ArcElement, 
  Tooltip, 
  Legend
);

interface CustomerTypeChartProps {
  salesData: SalesItem[];
}

export const CustomerTypeChart: React.FC<CustomerTypeChartProps> = ({ salesData }) => {
  // Process the data to group by customer type
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
    
    // Group sales by customer type
    const salesByType = salesData.reduce((acc, sale) => {
      const customerType = sale.customerType || 'Unknown';
      
      if (!acc[customerType]) {
        acc[customerType] = {
          count: 0,
          revenue: 0
        };
      }
      
      acc[customerType].count += 1;
      acc[customerType].revenue += sale.total;
      
      return acc;
    }, {} as Record<string, { count: number, revenue: number }>);
    
    // Prepare colors
    const backgroundColors = [
      'rgba(255, 99, 132, 0.6)',
      'rgba(54, 162, 235, 0.6)',
      'rgba(255, 206, 86, 0.6)',
      'rgba(75, 192, 192, 0.6)',
      'rgba(153, 102, 255, 0.6)'
    ];
    
    const borderColors = [
      'rgba(255, 99, 132, 1)',
      'rgba(54, 162, 235, 1)',
      'rgba(255, 206, 86, 1)',
      'rgba(75, 192, 192, 1)',
      'rgba(153, 102, 255, 1)'
    ];
    
    const types = Object.keys(salesByType).sort();
    
    return {
      labels: types,
      datasets: [
        {
          label: 'Sales Count',
          data: types.map(type => salesByType[type].count),
          backgroundColor: backgroundColors.slice(0, types.length),
          borderColor: borderColors.slice(0, types.length),
          borderWidth: 1,
        },
        {
          label: 'Revenue',
          data: types.map(type => salesByType[type].revenue),
          backgroundColor: backgroundColors.map(color => color.replace('0.6', '0.3')),
          borderColor: borderColors,
          borderWidth: 1,
        }
      ]
    };
  }, [salesData]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true
      }
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.dataset.label || '';
            const value = context.raw || 0;
            return label === 'Revenue' ? `${label}: ₹${value.toLocaleString()}` : `${label}: ${value}`;
          }
        }
      }
    }
  };

  return (
    <div className="w-full h-full">
      {salesData && salesData.length > 0 ? (
        <Bar data={chartData} options={options} />
      ) : (
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">No sales data available</p>
        </div>
      )}
    </div>
  );
};
