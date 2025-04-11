
import { format } from "date-fns";
import { TDocumentDefinitions } from "pdfmake/interfaces";
import { Quotation } from "@/types/sales";
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

// Standard terms for quotations
const standardQuotationTerms = [
  'Quotation valid for 15 days from the date of issue.',
  'Delivery within 5-7 business days after confirmation.',
  'Payment terms: 50% advance, 50% on delivery.',
  'Warranty: 1 year onsite (from installation date).'
];

// Generate PDF for quotation
export const generateQuotationPdf = (quotation: Quotation): void => {
  try {
    // Create document details
    const quotationDetails = [
      { label: 'Quotation No', value: quotation.quotationNumber },
      { label: 'Date', value: format(new Date(quotation.createdAt), "MMMM dd, yyyy") }
    ];

    // Create an array for content with non-conditional items first
    const contentItems: any[] = [
      // Header with Logo and Company Name
      createDocumentHeader('QUOTATION'),
      
      // Company and client information
      {
        columns: [
          // Company Information
          {
            width: '60%',
            ...createCompanyInfoSection()
          },
          // Quotation Details
          {
            width: '40%',
            ...createDocumentDetails(quotationDetails)
          }
        ],
        columnGap: 10,
        margin: [0, 20, 0, 20]
      },
      
      // Client Information
      createEntityInfoSection('Client', quotation.customerName, '123, Business Park, Pune, Maharashtra'),
      
      // Items Table
      createItemsTable(quotation.items),
      
      // Total Section
      createTotalsSection(quotation.subtotal, quotation.totalGst, quotation.grandTotal),
      
      // Terms and conditions
      ...createTermsSection(standardQuotationTerms, quotation.terms)
    ];
    
    // Add notes section if provided
    if (quotation.notes) {
      contentItems.push(...createNotesSection(quotation.notes));
    }
    
    // Add thank you note
    contentItems.push(createThankYouNote('Thank you for choosing United Copier!'));
    
    const docDefinition: TDocumentDefinitions = {
      pageSize: 'A4',
      pageMargins: [40, 40, 40, 60],
      content: contentItems,
      defaultStyle: {
        font: 'Roboto'
      },
      footer: getPageFooter(),
      styles
    };

    downloadPdf(docDefinition, `Quotation_${quotation.quotationNumber}.pdf`);
  } catch (error) {
    console.error("PDF generation error:", error);
    throw error;
  }
};
