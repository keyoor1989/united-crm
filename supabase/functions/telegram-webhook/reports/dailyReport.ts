

import { formatCurrency } from "../parsers/quotation.ts";

/**
 * Generate a daily report
 */
export function generateDailyReport(data: {
  newCustomers: any[];
  quotations: any[];
  completedCalls: any[];
  serviceRevenue: number;
  date: string;
}): string {
  const { newCustomers, quotations, completedCalls, serviceRevenue, date } = data;
  
  const report = `
📊 <b>Daily Report</b> (${date})\n
<b>New Customers:</b> ${newCustomers?.length || 0}
${newCustomers && newCustomers.length > 0 ? 
  '\n' + newCustomers.slice(0, 5).map((c: any) => `- ${c.name} (${c.area})`).join('\n') + 
  (newCustomers.length > 5 ? `\n+ ${newCustomers.length - 5} more...` : '') : ''}

<b>Quotations Generated:</b> ${quotations?.length || 0}
${quotations && quotations.length > 0 ? 
  '\n' + quotations.slice(0, 5).map((q: any) => `- ${q.customer_name} (₹${formatCurrency(q.grand_total)})`).join('\n') + 
  (quotations.length > 5 ? `\n+ ${quotations.length - 5} more...` : '') : ''}

<b>Service Calls Completed:</b> ${completedCalls?.length || 0}
${completedCalls && completedCalls.length > 0 ? 
  '\n' + completedCalls.slice(0, 5).map((s: any) => `- ${s.customer_name} (${s.issue_type})`).join('\n') + 
  (completedCalls.length > 5 ? `\n+ ${completedCalls.length - 5} more...` : '') : ''}

<b>Total Service Revenue:</b> ₹${formatCurrency(serviceRevenue)}
`;
  
  return report;
}

/**
 * Calculate date range for today
 */
export function getTodayDateRange() {
  const now = new Date();
  const today = now.toISOString().split('T')[0]; // YYYY-MM-DD
  
  return {
    start: `${today}T00:00:00`,
    end: `${today}T23:59:59`,
    dateStr: now.toLocaleDateString()
  };
}
