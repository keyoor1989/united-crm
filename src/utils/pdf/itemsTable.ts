
import { Content } from "pdfmake/interfaces";
import { PurchaseItem } from "@/pages/inventory/UnifiedPurchase";
import { ItemsTableOptions } from "./sections/types";
import { PdfTableCell } from "./sections/types";

// Create items table for PDF
export const createItemsTable = (
  items: PurchaseItem[] | string, 
  options: ItemsTableOptions = {}
): Content => {
  const { alternateRowColors = false, showItemNumbers = false } = options;
  
  // Parse items if it's a string
  let parsedItems: PurchaseItem[] = [];
  if (typeof items === 'string') {
    try {
      parsedItems = JSON.parse(items);
    } catch (error) {
      console.error("Error parsing items string:", error);
      parsedItems = [];
    }
  } else {
    parsedItems = items as PurchaseItem[];
  }
  
  // Create header row
  const headerRow: PdfTableCell[] = [
    { text: 'Item', style: 'tableHeader' },
    { text: 'Category', style: 'tableHeader' },
    { text: 'Qty', style: 'tableHeader', alignment: 'center' },
    { text: 'Unit Price', style: 'tableHeader', alignment: 'right' },
    { text: 'GST', style: 'tableHeader', alignment: 'right' },
    { text: 'Amount', style: 'tableHeader', alignment: 'right' }
  ];
  
  if (showItemNumbers) {
    headerRow.unshift({ text: '#', style: 'tableHeader', alignment: 'center' });
  }
  
  // Create body rows
  const bodyRows = parsedItems.map((item, index) => {
    const rowData: PdfTableCell[] = [
      { text: item.itemName },
      { text: item.category || '' },
      { text: item.quantity.toString(), alignment: 'center' },
      { text: `₹${item.unitPrice.toFixed(2)}`, alignment: 'right' },
      { text: `₹${(item.gstAmount || 0).toFixed(2)}`, alignment: 'right' },
      { text: `₹${item.totalAmount.toFixed(2)}`, alignment: 'right' }
    ];
    
    if (showItemNumbers) {
      rowData.unshift({ text: (index + 1).toString(), alignment: 'center' });
    }
    
    return rowData;
  });
  
  // Combine header and body
  const tableBody = [headerRow, ...bodyRows];
  
  // Apply alternate row coloring if enabled
  if (alternateRowColors) {
    tableBody.forEach((row, index) => {
      if (index > 0 && index % 2 === 0) {
        // For odd rows (index starting at 0), apply a background color
        row.forEach((cell, cellIndex) => {
          tableBody[index][cellIndex] = {
            ...cell,
            fillColor: '#f9f9f9'
          };
        });
      }
    });
  }
  
  const widths = showItemNumbers 
    ? ['auto', '*', 'auto', 'auto', 'auto', 'auto', 'auto'] 
    : ['*', 'auto', 'auto', 'auto', 'auto', 'auto'];
  
  return {
    table: {
      headerRows: 1,
      widths,
      body: tableBody
    },
    layout: {
      hLineWidth: function(i, node) {
        return (i === 0 || i === 1 || i === node.table.body.length) ? 1 : 0.5;
      },
      vLineWidth: function() {
        return 0;
      },
      hLineColor: function(i) {
        return i === 1 ? 'black' : '#dddddd';
      },
      paddingTop: function(i) {
        return (i === 0) ? 4 : 8;
      },
      paddingBottom: function(i, node) {
        return (i === node.table.body.length - 1) ? 4 : 8;
      }
    },
    margin: [0, 10, 0, 10]
  };
};

