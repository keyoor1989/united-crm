
import { format } from "date-fns";
import { TDocumentDefinitions, Content } from "pdfmake/interfaces";
import { PurchaseOrder } from "@/types/sales";
import { styles, getPageFooter, downloadPdf } from "./config";
import { 
  createDocumentHeader, 
  createDocumentDetails,
  createEntityInfoSection,
  createTotalsSection,
  createTermsSection,
  createNotesSection,
  createThankYouNote,
  createBankDetailsSection,
  createSignatureSection
} from "./sections/contentSections";
import { createItemsTable } from "./itemsTable";
import { companyInfo } from "./config/companyInfo";
import { ItemsTableOptions, PdfAlignment } from "./sections/types";

// Standard terms for purchase orders
const standardPurchaseOrderTerms = [
  'Standard terms and conditions apply.',
  'Delivery expected within the timeframe specified above.',
  'Payment terms: As per agreed terms.',
  'All prices are inclusive of applicable taxes.'
];

// Generate PDF for purchase order - cash or bill purchase
export const generatePurchaseOrderPdf = (order: PurchaseOrder): void => {
  try {
    // Validate required data
    if (!order) {
      throw new Error('Purchase order data is missing');
    }
    
    // Ensure items is always an array
    const items = Array.isArray(order.items) ? order.items : 
                (typeof order.items === 'string' ? JSON.parse(order.items) : []);
    
    // Create document details
    const orderDetails = [
      { label: 'PO No', value: order.poNumber },
      { label: 'Date', value: format(new Date(order.createdAt), "dd/MM/yyyy") },
      { label: 'Delivery Date', value: format(new Date(order.deliveryDate), "dd/MM/yyyy") }
    ];

    // Create an array for content with non-conditional items first
    const contentItems: Content[] = [
      // Header with Title (no logo)
      createDocumentHeader('PURCHASE ORDER'),
      
      // Vendor and order information
      {
        columns: [
          // Vendor Information
          {
            width: '60%',
            stack: createEntityInfoSection('Vendor', order.vendorName).stack
          },
          // PO Details
          {
            width: '40%',
            stack: createDocumentDetails(orderDetails).stack
          }
        ],
        columnGap: 10,
        margin: [0, 0, 0, 10]
      },
      
      // Items Table - Use the new enhanced function with options
      createItemsTable(items, {
        alternateRowColors: true,
        showItemNumbers: true
      })
    ];
    
    // Add totals section
    contentItems.push(createTotalsSection(order.subtotal, order.totalGst, order.grandTotal));

    // Add bank details section conditionally - only for billed purchases
    if (order.status !== "Cash Purchase") {
      contentItems.push(createBankDetailsSection());
    }
    
    // Add payment method section if it's a cash purchase
    if (order.status === "Cash Purchase") {
      contentItems.push({
        text: 'Payment Method: Cash',
        style: 'sectionTitle',
        margin: [0, 10, 0, 5]
      });
    }
    
    // Add terms section - correctly handle the terms content
    const termsSection = createTermsSection(standardPurchaseOrderTerms, order.terms);
    contentItems.push(termsSection);
    
    // Add notes section if provided
    if (order.notes) {
      const notesSection = createNotesSection(order.notes);
      contentItems.push(notesSection);
    }
    
    // Add signature section
    contentItems.push(createSignatureSection());
    
    // Add thank you note
    contentItems.push(createThankYouNote('Thank you for your business!'));
    
    const docDefinition: TDocumentDefinitions = {
      pageSize: 'A4',
      pageMargins: [40, 40, 40, 60],
      content: contentItems,
      defaultStyle: {
        font: 'Roboto'  // Set default font as Roboto
      },
      footer: getPageFooter() as any, // Use type assertion to fix type error
      styles: styles
    };

    downloadPdf(docDefinition, `PO_${order.poNumber}.pdf`);
  } catch (error) {
    console.error("PDF generation error:", error);
    throw new Error(`PDF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Generate PDF for cash memo (simplified version without billing details)
export const generateCashMemoPdf = (order: PurchaseOrder): void => {
  try {
    // Validate required data
    if (!order) {
      throw new Error('Purchase order data is missing');
    }
    
    // Ensure items is always an array
    const items = Array.isArray(order.items) ? order.items : 
                (typeof order.items === 'string' ? JSON.parse(order.items) : []);
    
    // Create document details
    const memoDetails = [
      { label: 'Receipt No', value: order.poNumber },
      { label: 'Date', value: format(new Date(order.createdAt), "dd/MM/yyyy") },
      { label: 'Payment', value: 'Cash' }
    ];

    // Create an array for content
    const contentItems: Content[] = [
      // Header with Title (no logo)
      {
        text: 'CASH RECEIPT',
        style: 'header',
        alignment: 'center' as PdfAlignment,
        margin: [0, 0, 0, 10]
      },
      
      // Company info at top
      {
        text: companyInfo.name,
        style: 'companyName',
        alignment: 'center' as PdfAlignment
      },
      {
        text: companyInfo.address,
        style: 'companyAddress',
        alignment: 'center' as PdfAlignment
      },
      {
        text: `Contact: ${companyInfo.contact}`,
        style: 'companyContact',
        alignment: 'center' as PdfAlignment
      },
      {
        columns: [
          // Vendor Information (simplified)
          {
            width: '60%',
            text: [
              { text: 'Vendor: ', bold: true },
              order.vendorName
            ]
          },
          // Receipt Details
          {
            width: '40%',
            stack: memoDetails.map(detail => ({
              text: [
                { text: `${detail.label}: `, bold: true },
                detail.value
              ],
              margin: [0, 2, 0, 0]
            }))
          }
        ],
        columnGap: 10,
        margin: [0, 10, 0, 10]
      },
      
      // Items Table (simplified)
      createItemsTable(items, {
        alternateRowColors: true,
        showItemNumbers: true
      }),
      
      // Total Section (simplified)
      {
        table: {
          widths: ['*', 'auto'],
          body: [
            [
              { text: 'Total Amount:', style: 'totalLabel', alignment: 'right' as PdfAlignment },
              { text: `₹${order.grandTotal.toLocaleString()}`, style: 'totalValue' }
            ]
          ]
        },
        layout: 'noBorders',
        margin: [0, 10, 0, 10]
      },
      
      // Signature section (simplified)
      {
        columns: [
          {
            width: '50%',
            text: '_____________________\nReceived By',
            alignment: 'center' as PdfAlignment,
            margin: [0, 40, 0, 0]
          },
          {
            width: '50%',
            text: '_____________________\nAuthorized Signature',
            alignment: 'center' as PdfAlignment,
            margin: [0, 40, 0, 0]
          }
        ]
      },
      
      // Thank you note
      {
        text: 'Thank you for your business!',
        alignment: 'center' as PdfAlignment,
        margin: [0, 20, 0, 0],
        style: 'thankYouNote'
      }
    ];
    
    const docDefinition: TDocumentDefinitions = {
      pageSize: 'A4',
      pageMargins: [40, 40, 40, 60],
      content: contentItems,
      defaultStyle: {
        font: 'Roboto'
      },
      styles
    };

    downloadPdf(docDefinition, `CashMemo_${order.poNumber}.pdf`);
  } catch (error) {
    console.error("Cash memo generation error:", error);
    throw new Error(`Cash memo generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Add new function to modify the ItemsTable to support simplified format
export const createSimplifiedItemsTable = (items: any[], options: ItemsTableOptions = {}) => {
  const { alternateRowColors = false, showItemNumbers = false } = options;
  
  // Create header row
  const headerRow = [
    { text: 'Item', style: 'tableHeader' },
    { text: 'Qty', style: 'tableHeader', alignment: 'center' as PdfAlignment },
    { text: 'Price', style: 'tableHeader', alignment: 'right' as PdfAlignment },
    { text: 'Amount', style: 'tableHeader', alignment: 'right' as PdfAlignment }
  ];
  
  if (showItemNumbers) {
    headerRow.unshift({ text: '#', style: 'tableHeader', alignment: 'center' as PdfAlignment });
  }
  
  // Create body rows
  const bodyRows = items.map((item, index) => {
    const rowData = [
      item.name || item.description,
      { text: item.quantity.toString(), alignment: 'center' as PdfAlignment },
      { text: `₹${item.unitPrice.toLocaleString()}`, alignment: 'right' as PdfAlignment },
      { text: `₹${item.total.toLocaleString()}`, alignment: 'right' as PdfAlignment }
    ];
    
    if (showItemNumbers) {
      rowData.unshift({ text: (index + 1).toString(), alignment: 'center' as PdfAlignment });
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
        row.forEach((cell: any, cellIndex) => {
          if (typeof cell === 'object') {
            cell.fillColor = '#f9f9f9';
          } else {
            // Convert primitive values to objects with fillColor
            row[cellIndex] = {
              text: cell,
              fillColor: '#f9f9f9'
            };
          }
        });
      }
    });
  }
  
  const widths = showItemNumbers 
    ? ['auto', '*', 'auto', 'auto', 'auto'] 
    : ['*', 'auto', 'auto', 'auto'];
  
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
