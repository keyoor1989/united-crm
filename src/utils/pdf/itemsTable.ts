
import { Content } from "pdfmake/interfaces";
import { styles } from "./pdfConfig";
import { QuotationItem, PurchaseOrderItem, ProductSpecs } from "@/types/sales";

// Helper to format item specifications
const formatItemSpecs = (specs?: ProductSpecs, description?: string): string => {
  if (description) return description;
  
  if (!specs) return '';
  
  const details = [];
  
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

// Create items table for quotations or purchase orders
export const createItemsTable = (
  items: (QuotationItem | PurchaseOrderItem)[]
): Content => {
  return {
    table: {
      headerRows: 1,
      widths: [30, '*', 40, 60, 70],
      body: [
        [
          { text: '#', style: 'tableHeader' },
          { text: 'Description', style: 'tableHeader' },
          { text: 'Qty', style: 'tableHeader' },
          { text: 'Rate (₹)', style: 'tableHeader' },
          { text: 'Amount (₹)', style: 'tableHeader' }
        ],
        ...items.map((item, index) => [
          { text: (index + 1).toString(), style: index % 2 === 0 ? 'tableRow' : 'tableRowEven', alignment: 'center' },
          { 
            stack: [
              { text: item.name, style: index % 2 === 0 ? 'tableRow' : 'tableRowEven', bold: true },
              { text: formatItemSpecs(item.specs, item.description), style: index % 2 === 0 ? 'tableRow' : 'tableRowEven', fontSize: 8 }
            ] 
          },
          { text: item.quantity.toString(), style: index % 2 === 0 ? 'tableRow' : 'tableRowEven', alignment: 'center' },
          { text: `₹${item.unitPrice.toLocaleString()}`, style: index % 2 === 0 ? 'tableRow' : 'tableRowEven', alignment: 'right' },
          { text: `₹${item.total.toLocaleString()}`, style: index % 2 === 0 ? 'tableRow' : 'tableRowEven', alignment: 'right' }
        ])
      ]
    },
    layout: {
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
    }
  };
};
