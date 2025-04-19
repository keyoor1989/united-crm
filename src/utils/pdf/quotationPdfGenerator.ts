
import { format } from "date-fns";
import { TDocumentDefinitions, Content } from "pdfmake/interfaces";
import { Quotation, QuotationItem } from "@/types/sales";
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
import { PurchaseItem } from "@/pages/inventory/UnifiedPurchase";
import { PdfAlignment } from "./sections/types";

// Standard terms for quotations
const standardQuotationTerms = [
  'Quotation valid for 15 days from the date of issue.',
  'Delivery within 5-7 business days after confirmation.',
  'Payment terms: 50% advance, 50% on delivery.',
  'Warranty: 1 year onsite (from installation date).'
];

// Helper function to convert QuotationItem[] to PurchaseItem[]
const convertToPurchaseItems = (items: QuotationItem[]): PurchaseItem[] => {
  return items.map(item => ({
    id: item.id,
    itemId: item.productId,
    itemName: item.name,
    category: item.category || 'Other',
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    gstAmount: item.gstAmount || 0,
    totalAmount: item.total,
    isCustomItem: item.isCustomItem || false,
    gstPercent: item.gstPercent || 0,
    specs: item.specs || {}
  }));
};

// Generate PDF for quotation
export const generateQuotationPdf = (quotation: Quotation): void => {
  try {
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
    
    // Convert QuotationItems to PurchaseItems for the table renderer
    const purchaseItems = convertToPurchaseItems(items);
    
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
      // Header with Company Name (no logo)
      createDocumentHeader('QUOTATION'),
      
      // Client and quotation details
      {
        columns: [
          // Client Information
          {
            width: '60%',
            stack: createEntityInfoSection('Bill To', quotation.customerName).stack
          },
          // Quotation Details
          {
            width: '40%',
            stack: createDocumentDetails(quotationDetails).stack
          }
        ],
        columnGap: 10,
        margin: [0, 0, 0, 10]
      },
      
      // Items Table - Use the new enhanced function with options
      createItemsTable(purchaseItems, {
        alternateRowColors: true,
        showItemNumbers: true
      }),
      
      // Total Section with Amount in Words
      createTotalsSection(quotation.subtotal, quotation.totalGst || 0, quotation.grandTotal),
      
      // Bank Details
      createBankDetailsSection(),
    ];
    
    // Add terms section - correctly handle the terms content
    const termsSection = createTermsSection(standardQuotationTerms, quotation.terms);
    contentItems.push(termsSection);
    
    // Add notes section if provided
    if (quotation.notes) {
      const notesSection = createNotesSection(quotation.notes);
      contentItems.push(notesSection);
    }
    
    // Add signature section
    contentItems.push(createSignatureSection());
    
    // Add thank you note
    contentItems.push(createThankYouNote('Thank you for your business!'));
    
    // Create the document definition with explicit font settings
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

    console.log("PDF document definition created, initiating download");
    
    // Call the download function directly (the delay is now handled in the download function)
    downloadPdf(docDefinition, `Quotation_${quotation.quotationNumber}.pdf`);
  } catch (error) {
    console.error("PDF generation error:", error);
    throw new Error(`PDF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
