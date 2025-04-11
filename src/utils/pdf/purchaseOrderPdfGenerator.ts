
import { format } from "date-fns";
import { TDocumentDefinitions } from "pdfmake/interfaces";
import { PurchaseOrder } from "@/types/sales";
import { styles, getPageFooter, downloadPdf } from "./pdfConfig";
import { 
  createDocumentHeader, 
  createCompanyInfoSection,
  createDocumentDetails,
  createEntityInfoSection,
  createTotalsSection,
  createTermsSection,
  createNotesSection,
  createThankYouNote
} from "./contentSections";
import { createItemsTable } from "./itemsTable";

// Standard terms for purchase orders
const standardPurchaseOrderTerms = [
  'Standard terms and conditions apply.',
  'Delivery expected within the timeframe specified above.'
];

// Generate PDF for purchase order
export const generatePurchaseOrderPdf = (order: PurchaseOrder): void => {
  try {
    // Create document details
    const orderDetails = [
      { label: 'PO No', value: order.poNumber },
      { label: 'Date', value: format(new Date(order.createdAt), "MMMM dd, yyyy") },
      { label: 'Delivery Date', value: format(new Date(order.deliveryDate), "MMMM dd, yyyy") }
    ];

    // Create an array for content with non-conditional items first
    const contentItems: any[] = [
      // Header with Logo and Title
      createDocumentHeader('PURCHASE ORDER'),
      
      // Company and vendor information
      {
        columns: [
          // Company Information
          {
            width: '60%',
            ...createCompanyInfoSection()
          },
          // PO Details
          {
            width: '40%',
            ...createDocumentDetails(orderDetails)
          }
        ],
        columnGap: 10,
        margin: [0, 20, 0, 20]
      },
      
      // Vendor Information
      createEntityInfoSection('Vendor', order.vendorName, 'Vendor Address'),
      
      // Items Table
      createItemsTable(order.items),
      
      // Total Section
      createTotalsSection(order.subtotal, order.totalGst, order.grandTotal),
      
      // Terms and conditions
      ...createTermsSection(standardPurchaseOrderTerms, order.terms)
    ];
    
    // Add notes section if provided
    if (order.notes) {
      contentItems.push(...createNotesSection(order.notes));
    }
    
    // Add thank you note
    contentItems.push(createThankYouNote('Thank you for your business!'));
    
    const docDefinition: TDocumentDefinitions = {
      pageSize: 'A4',
      pageMargins: [40, 40, 40, 60],
      content: contentItems,
      defaultStyle: {
        font: 'Roboto'
      },
      footer: getPageFooter(),
      styles: styles
    };

    downloadPdf(docDefinition, `PO_${order.poNumber}.pdf`);
  } catch (error) {
    console.error("PDF generation error:", error);
    throw error;
  }
};
