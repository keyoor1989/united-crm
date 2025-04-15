
import { Content, TableCell, TableLayout } from "pdfmake/interfaces";
import { styles } from "./config"; // Fix the import path
import { QuotationItem, PurchaseOrderItem, ProductSpecs } from "@/types/sales";

// Interface for table options
export interface ItemsTableOptions {
  includeGst?: boolean;
  alternateRowColors?: boolean;
  showItemNumbers?: boolean;
  widths?: (string | number)[];
  headerStyle?: string;
  rowStyle?: string;
  evenRowStyle?: string;
}

// Default options
const defaultTableOptions: ItemsTableOptions = {
  includeGst: true,
  alternateRowColors: true,
  showItemNumbers: true,
  widths: [30, '*', 40, 60, 70],
  headerStyle: 'tableHeader',
  rowStyle: 'tableRow',
  evenRowStyle: 'tableRowEven'
};

// Helper to format item specifications
export const formatItemSpecs = (specs?: ProductSpecs, description?: string): string => {
  if (description) return description;
  
  if (!specs) return '';
  
  const details: string[] = [];
  
  if (specs.color !== undefined) {
    details.push(specs.color ? 'Color' : 'B&W');
  }
  
  if (specs.speed) {
    details.push(`${specs.speed} ppm`);
  }
  
  if (specs.ram) {
    details.push(`${specs.ram} RAM`);
  }
  
  if (specs.paperTray) {
    details.push(`Paper Tray: ${specs.paperTray}`);
  }
  
  if (specs.duplex !== undefined) {
    details.push(specs.duplex ? 'Duplex Printing' : 'Single-sided Printing');
  }
  
  if (specs.additionalSpecs) {
    Object.entries(specs.additionalSpecs).forEach(([key, value]) => {
      details.push(`${key}: ${value}`);
    });
  }
  
  return details.join(', ');
};

// Function to format currency
export const formatCurrency = (amount: number): string => {
  return `₹${amount.toLocaleString()}`;
};

// Create a default table layout
export const createDefaultTableLayout = (): TableLayout => {
  return {
    hLineWidth: function(i: number, node: any) {
      return (i === 0 || i === 1 || i === node.table.body.length) ? 1 : 0.5;
    },
    vLineWidth: function(i: number, node: any) {
      return (i === 0 || i === node.table.widths.length) ? 1 : 0.5;
    },
    hLineColor: function(i: number) {
      return (i === 0 || i === 1) ? '#aaaaaa' : '#dddddd';
    },
    vLineColor: function(i: number, node: any) {
      return (i === 0 || i === node.table.widths.length) ? '#aaaaaa' : '#dddddd';
    }
  };
};

// Create table header
export const createTableHeader = (options: ItemsTableOptions = {}): TableCell[] => {
  const opts = { ...defaultTableOptions, ...options };
  
  return [
    { text: '#', style: opts.headerStyle },
    { text: 'Description', style: opts.headerStyle },
    { text: 'Qty', style: opts.headerStyle },
    { text: 'Rate (₹)', style: opts.headerStyle },
    { text: 'Amount (₹)', style: opts.headerStyle }
  ];
};

// Create table row for an item
export const createTableRow = (
  item: QuotationItem | PurchaseOrderItem, 
  index: number, 
  options: ItemsTableOptions = {}
): TableCell[] => {
  const opts = { ...defaultTableOptions, ...options };
  const rowStyle = index % 2 === 0 ? opts.rowStyle : opts.evenRowStyle;
  
  return [
    { 
      text: opts.showItemNumbers ? (index + 1).toString() : '', 
      style: rowStyle, 
      alignment: 'center' 
    },
    { 
      stack: [
        { text: item.name, style: rowStyle, bold: true },
        { text: formatItemSpecs(item.specs, item.description), style: rowStyle, fontSize: 8 }
      ] 
    },
    { 
      text: item.quantity.toString(), 
      style: rowStyle, 
      alignment: 'center' 
    },
    { 
      text: formatCurrency(item.unitPrice), 
      style: rowStyle, 
      alignment: 'right' 
    },
    { 
      text: formatCurrency(item.total), 
      style: rowStyle, 
      alignment: 'right' 
    }
  ];
};

// Create items table for quotations or purchase orders
export const createItemsTable = (
  items: (QuotationItem | PurchaseOrderItem)[],
  options: ItemsTableOptions = {}
): Content => {
  // Merge default options with provided options
  const opts = { ...defaultTableOptions, ...options };
  
  return {
    table: {
      headerRows: 1,
      widths: opts.widths,
      body: [
        createTableHeader(opts),
        ...items.map((item, index) => 
          createTableRow(item, index, opts)
        )
      ]
    },
    layout: createDefaultTableLayout(),
    style: 'itemsTable'
  };
};
