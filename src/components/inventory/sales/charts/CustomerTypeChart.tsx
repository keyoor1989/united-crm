
import React, { useMemo } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { SalesItem } from '@/components/inventory/sales/SalesTable';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

interface CustomerTypeChartProps {
  salesData: SalesItem[];
}

export const CustomerTypeChart: React.FC<CustomerTypeChartProps> = ({ salesData }) => {
  // Process the data to group by customer type
  const chartData = useMemo(() => {
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
      }
    }
  };

  return <Bar data={chartData} options={options} />;
};
