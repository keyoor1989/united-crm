
import { styles } from "./pdfConfig";
import { QuotationItem, PurchaseOrderItem, ProductSpecs } from "@/types/sales";

// Helper to format item specifications
const formatItemSpecs = (specs?: ProductSpecs, description?: string): string => {
  if (description) return description;
  
  if (!specs) return '';
  
  return `${specs.color ? 'Color' : 'B&W'}${specs.speed ? `, ${specs.speed}` : ''}${specs.ram ? `, ${specs.ram} RAM` : ''}`;
};

// Create items table for quotations or purchase orders
export const createItemsTable = (
  items: (QuotationItem | PurchaseOrderItem)[]
) => {
  return {
    table: {
      headerRows: 1,
      widths: ['*', '*', 'auto', 'auto', 'auto', 'auto'],
      body: [
        [
          { text: 'Product', style: 'tableHeader' },
          { text: 'Specifications', style: 'tableHeader' },
          { text: 'Qty', style: 'tableHeader' },
          { text: 'Rate (₹)', style: 'tableHeader' },
          { text: 'GST%', style: 'tableHeader' },
          { text: 'Total (₹)', style: 'tableHeader' }
        ],
        ...items.map((item, index) => [
          { text: item.name, style: index % 2 === 0 ? 'tableRow' : 'tableRowEven' },
          { 
            text: formatItemSpecs(item.specs, item.description), 
            style: index % 2 === 0 ? 'tableRow' : 'tableRowEven' 
          },
          { text: item.quantity.toString(), style: index % 2 === 0 ? 'tableRow' : 'tableRowEven', alignment: 'center' },
          { text: `₹${item.unitPrice.toLocaleString()}`, style: index % 2 === 0 ? 'tableRow' : 'tableRowEven', alignment: 'right' },
          { text: `${item.gstPercent}%`, style: index % 2 === 0 ? 'tableRow' : 'tableRowEven', alignment: 'center' },
          { text: `₹${item.total.toLocaleString()}`, style: index % 2 === 0 ? 'tableRow' : 'tableRowEven', alignment: 'right' }
        ])
      ]
    }
  };
};
