
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
    console.log("Quotation data structure:", JSON.stringify({
      id: quotation.id,
      quotationNumber: quotation.quotationNumber,
      customerName: quotation.customerName,
      itemsType: typeof quotation.items,
      itemsIsArray: Array.isArray(quotation.items),
      itemsLength: Array.isArray(quotation.items) ? quotation.items.length : 'not an array',
      createdAt: quotation.createdAt,
      validUntil: quotation.validUntil
    }));
    
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
        const parsedItems = JSON.parse(quotation.items);
        if (Array.isArray(parsedItems)) {
          items = parsedItems;
        } else {
          console.error("Items JSON parsed but not an array:", parsedItems);
          items = [];
        }
      } else if (quotation.items) {
        console.error("Items is not an array or string:", quotation.items);
        items = [];
      }
    } catch (error) {
      console.error("Error parsing items:", error);
      console.log("Original items value:", quotation.items);
      items = [];
    }
    
    console.log("Items prepared for PDF:", JSON.stringify({
      isArray: Array.isArray(items),
      length: items.length,
      sample: items.length > 0 ? items[0].name : 'no items' 
    }));
    
    // Validate dates
    let createdAtDate = new Date();
    try {
      createdAtDate = new Date(quotation.createdAt);
      if (isNaN(createdAtDate.getTime())) {
        console.warn("Invalid created date format, using current date");
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
        } else {
          console.warn("Invalid valid until date format, using default 15 days from now");
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

    console.log("PDF document definition created, initiating download");
    downloadPdf(docDefinition, `Quotation_${quotation.quotationNumber}.pdf`);
    console.log("PDF generation successful");
  } catch (error) {
    console.error("PDF generation error:", error);
    throw error;
  }
};
