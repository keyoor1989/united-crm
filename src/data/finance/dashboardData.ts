
import { DepartmentSummary, FinanceSummary, FinanceTrend } from "@/types/finance";

// Dashboard data for department summary
export const departmentSummary: DepartmentSummary[] = [
  {
    name: "Sales",
    revenue: 118000,
    expenses: 8000,
    profit: 110000
  },
  {
    name: "Service",
    revenue: 15000,
    expenses: 20500,
    profit: -5500
  },
  {
    name: "AMC",
    revenue: 45000,
    expenses: 10000,
    profit: 35000
  },
  {
    name: "Rental",
    revenue: 18000,
    expenses: 5000,
    profit: 13000
  },
  {
    name: "Administration",
    revenue: 0,
    expenses: 37500,
    profit: -37500
  }
];

// Finance summary for the dashboard
export const financeSummary: FinanceSummary = {
  totalRevenue: 196000,
  totalExpenses: 81000,
  netProfit: 115000,
  cashInHand: 23000,
  pendingReceivables: 100000,
  upcomingPayments: 45000
};

// Monthly trend data for charts
export const financeMonthlyTrend: FinanceTrend[] = [
  {
    month: "Jan",
    revenue: 180000,
    expenses: 75000,
    profit: 105000
  },
  {
    month: "Feb",
    revenue: 185000,
    expenses: 78000,
    profit: 107000
  },
  {
    month: "Mar",
    revenue: 190000,
    expenses: 80000,
    profit: 110000
  },
  {
    month: "Apr",
    revenue: 196000,
    expenses: 81000,
    profit: 115000
  }
];
