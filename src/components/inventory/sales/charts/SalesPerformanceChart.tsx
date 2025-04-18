
import React, { useMemo } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend,
  PointElement,
  LineElement,
  LineController,
  BarController
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { SalesItem } from '@/components/inventory/sales/SalesTable';
import { format, parseISO } from 'date-fns';
import { ChartData, ChartOptions } from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  LineController,
  BarController,
  Title,
  Tooltip,
  Legend
);

interface SalesPerformanceChartProps {
  salesData: SalesItem[];
}

export const SalesPerformanceChart: React.FC<SalesPerformanceChartProps> = ({ salesData }) => {
  // Process the data to group by date
  const chartData = useMemo(() => {
    // Group sales by date
    const salesByDate = salesData.reduce((acc, sale) => {
      const date = format(new Date(sale.date), 'yyyy-MM-dd');
      
      if (!acc[date]) {
        acc[date] = {
          count: 0,
          revenue: 0
        };
      }
      
      acc[date].count += 1;
      acc[date].revenue += sale.total;
      
      return acc;
    }, {} as Record<string, { count: number, revenue: number }>);
    
    // Sort dates and create chart data
    const sortedDates = Object.keys(salesByDate).sort();
    
    return {
      labels: sortedDates.map(date => format(parseISO(date), 'MMM dd')),
      datasets: [
        {
          label: 'Sales Count',
          data: sortedDates.map(date => salesByDate[date].count),
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
          borderColor: 'rgba(53, 162, 235, 1)',
          borderWidth: 1,
          order: 1
        },
        {
          label: 'Revenue',
          data: sortedDates.map(date => salesByDate[date].revenue),
          borderColor: 'rgba(255, 99, 132, 1)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderWidth: 2,
          type: 'line' as const,
          yAxisID: 'y1',
          order: 0
        }
      ]
    };
  }, [salesData]);

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Sales Count'
        }
      },
      y1: {
        position: 'right' as const,
        beginAtZero: true,
        title: {
          display: true,
          text: 'Revenue (₹)'
        },
        grid: {
          drawOnChartArea: false
        }
      }
    }
  };

  return <Bar data={chartData as ChartData<'bar'>} options={options} />;
};
