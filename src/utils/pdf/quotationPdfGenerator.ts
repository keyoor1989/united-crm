
import { format } from "date-fns";
import { TDocumentDefinitions, Content } from "pdfmake/interfaces";
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
    let items: QuotationItem[] = [];
    try {
      if (Array.isArray(quotation.items)) {
        items = quotation.items;
      } else if (typeof quotation.items === 'string') {
        items = JSON.parse(quotation.items);
      } else if (quotation.items) {
        console.error("Items is not an array or string:", quotation.items);
        items = [];
      }
    } catch (error) {
      console.error("Error parsing items:", error);
      items = [];
    }
    
    // Validate dates
    let createdAtDate = new Date();
    try {
      createdAtDate = new Date(quotation.createdAt);
      if (isNaN(createdAtDate.getTime())) {
        createdAtDate = new Date();
      }
    } catch (error) {
      console.warn("Error parsing created date, using current date:", error);
      createdAtDate = new Date();
    }
    
    let validUntilDate = new Date();
    validUntilDate.setDate(validUntilDate.getDate() + 15); // Default 15 days validity
    try {
      if (quotation.validUntil) {
        const parsedDate = new Date(quotation.validUntil);
        if (!isNaN(parsedDate.getTime())) {
          validUntilDate = parsedDate;
        }
      }
    } catch (error) {
      console.warn("Error parsing valid until date, using default:", error);
    }
    
    // Create document details
    const quotationDetails = [
      { label: 'Quotation No', value: quotation.quotationNumber },
      { label: 'Date', value: format(createdAtDate, "dd/MM/yyyy") },
      { label: 'Valid Until', value: format(validUntilDate, "dd/MM/yyyy") }
    ];

    // Create document content
    const contentItems: Content[] = [
      // Header with Logo and Company Name
      createDocumentHeader('QUOTATION'),
      
      // Client and quotation details
      {
        columns: [
          // Client Information
          {
            width: '60%',
            stack: [
              ...(createEntityInfoSection('Bill To', quotation.customerName) as any).stack
            ]
          },
          // Quotation Details
          {
            width: '40%',
            stack: [
              ...(createDocumentDetails(quotationDetails) as any).stack
            ]
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
      ...(createTermsSection(standardQuotationTerms, quotation.terms) as any)
    ];
    
    // Add notes section if provided
    if (quotation.notes) {
      contentItems.push(...(createNotesSection(quotation.notes) as any));
    }
    
    // Add signature section
    contentItems.push(createSignatureSection());
    
    // Add thank you note
    contentItems.push(createThankYouNote('Thank you for your business!'));
    
    // Create the document definition
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

    console.log("PDF document definition created, initiating download");
    // Call the download function
    downloadPdf(docDefinition, `Quotation_${quotation.quotationNumber}.pdf`);
  } catch (error) {
    console.error("PDF generation error:", error);
    alert("There was an error generating the PDF. Please check the console for details.");
  }
};
