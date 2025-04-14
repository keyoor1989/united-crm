
import { format } from "date-fns";
import { TDocumentDefinitions, Content } from "pdfmake/interfaces";
import { PurchaseOrder } from "@/types/sales";
import { styles, getPageFooter, downloadPdf } from "./pdfConfig";
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
} from "./contentSections";
import { createItemsTable } from "./itemsTable";

// Standard terms for purchase orders
const standardPurchaseOrderTerms = [
  'Standard terms and conditions apply.',
  'Delivery expected within the timeframe specified above.',
  'Payment terms: As per agreed terms.',
  'All prices are inclusive of applicable taxes.'
];

// Generate PDF for purchase order
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
      // Header with Logo and Title
      createDocumentHeader('PURCHASE ORDER'),
      
      // Vendor and order information
      {
        columns: [
          // Vendor Information
          {
            width: '60%',
            stack: [
              ...(createEntityInfoSection('Vendor', order.vendorName) as any).stack
            ]
          },
          // PO Details
          {
            width: '40%',
            stack: [
              ...(createDocumentDetails(orderDetails) as any).stack
            ]
          }
        ],
        columnGap: 10,
        margin: [0, 0, 0, 10]
      },
      
      // Items Table
      createItemsTable(items),
      
      // Total Section
      createTotalsSection(order.subtotal, order.totalGst, order.grandTotal),
      
      // Bank Details
      createBankDetailsSection(),
      
      // Terms and conditions
      ...(createTermsSection(standardPurchaseOrderTerms, order.terms) as any)
    ];
    
    // Add notes section if provided
    if (order.notes) {
      contentItems.push(...(createNotesSection(order.notes) as any));
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
        font: 'Helvetica'
      },
      footer: getPageFooter(),
      styles: styles
    };

    downloadPdf(docDefinition, `PO_${order.poNumber}.pdf`);
  } catch (error) {
    console.error("PDF generation error:", error);
    alert("There was an error generating the PDF. Please try again.");
  }
};
