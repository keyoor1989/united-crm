
import { format } from "date-fns";
import { TDocumentDefinitions } from "pdfmake/interfaces";
import { Quotation, QuotationItem } from "@/types/sales";
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
    console.log("Generating PDF for quotation:", quotation.quotationNumber);
    
    // Validate required data
    if (!quotation) {
      throw new Error('Quotation data is missing');
    }
    
    if (!quotation.quotationNumber) {
      throw new Error('Quotation number is missing');
    }
    
    // Ensure items is always an array
    const items = Array.isArray(quotation.items) 
      ? quotation.items 
      : (typeof quotation.items === 'string' ? JSON.parse(quotation.items) : []);
    
    if (!Array.isArray(items)) {
      console.error("Items is still not an array after parsing:", items);
      throw new Error("Invalid items format: items must be an array");
    }
    
    // Validate dates
    let createdAtDate = new Date();
    try {
      createdAtDate = new Date(quotation.createdAt);
    } catch (error) {
      console.warn("Invalid created date format, using current date");
    }
    
    let validUntilDate = new Date();
    validUntilDate.setDate(validUntilDate.getDate() + 15); // Default 15 days validity
    try {
      validUntilDate = new Date(quotation.validUntil);
    } catch (error) {
      console.warn("Invalid valid until date format, using default 15 days from now");
    }
    
    // Create document details
    const quotationDetails = [
      { label: 'Quotation No', value: quotation.quotationNumber },
      { label: 'Date', value: format(createdAtDate, "dd/MM/yyyy") },
      { label: 'Valid Until', value: format(validUntilDate, "dd/MM/yyyy") }
    ];

    // Create an array for content with non-conditional items first
    const contentItems: any[] = [
      // Header with Logo and Company Name
      createDocumentHeader('QUOTATION'),
      
      // Client and quotation details
      {
        columns: [
          // Client Information
          {
            width: '60%',
            ...createEntityInfoSection('Bill To', quotation.customerName)
          },
          // Quotation Details
          {
            width: '40%',
            ...createDocumentDetails(quotationDetails)
          }
        ],
        columnGap: 10,
        margin: [0, 0, 0, 10]
      },
      
      // Items Table
      createItemsTable(items),
      
      // Total Section with Amount in Words
      createTotalsSection(quotation.subtotal, quotation.totalGst, quotation.grandTotal),
      
      // Bank Details
      createBankDetailsSection(),
      
      // Terms and conditions
      ...createTermsSection(standardQuotationTerms, quotation.terms)
    ];
    
    // Add notes section if provided
    if (quotation.notes) {
      contentItems.push(...createNotesSection(quotation.notes));
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

    downloadPdf(docDefinition, `Quotation_${quotation.quotationNumber}.pdf`);
    console.log("PDF generation successful");
  } catch (error) {
    console.error("PDF generation error:", error);
    throw error;
  }
};
