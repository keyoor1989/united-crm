
import { format } from "date-fns";
import { TDocumentDefinitions } from "pdfmake/interfaces";
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
    // Create document details
    const orderDetails = [
      { label: 'PO No', value: order.poNumber },
      { label: 'Date', value: format(new Date(order.createdAt), "dd/MM/yyyy") },
      { label: 'Delivery Date', value: format(new Date(order.deliveryDate), "dd/MM/yyyy") }
    ];

    // Create an array for content with non-conditional items first
    const contentItems: any[] = [
      // Header with Logo and Title
      createDocumentHeader('PURCHASE ORDER'),
      
      // Vendor and order information
      {
        columns: [
          // Vendor Information
          {
            width: '60%',
            ...createEntityInfoSection('Vendor', order.vendorName)
          },
          // PO Details
          {
            width: '40%',
            ...createDocumentDetails(orderDetails)
          }
        ],
        columnGap: 10,
        margin: [0, 0, 0, 10]
      },
      
      // Items Table
      createItemsTable(order.items),
      
      // Total Section
      createTotalsSection(order.subtotal, order.totalGst, order.grandTotal),
      
      // Bank Details
      createBankDetailsSection(),
      
      // Terms and conditions
      ...createTermsSection(standardPurchaseOrderTerms, order.terms)
    ];
    
    // Add notes section if provided
    if (order.notes) {
      contentItems.push(...createNotesSection(order.notes));
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
