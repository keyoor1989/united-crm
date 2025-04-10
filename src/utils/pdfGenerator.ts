
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { TDocumentDefinitions } from "pdfmake/interfaces";
import { Quotation, PurchaseOrder } from "@/types/sales";
import { format } from "date-fns";

// Register the virtual file system with pdfMake
pdfMake.vfs = (pdfFonts as any).vfs;

// Define fonts for the document
pdfMake.fonts = {
  Roboto: {
    normal: 'Roboto-Regular.ttf',
    bold: 'Roboto-Medium.ttf',
    italics: 'Roboto-Italic.ttf',
    bolditalics: 'Roboto-MediumItalic.ttf'
  }
};

// Common PDF styling
const styles = {
  header: {
    fontSize: 22,
    bold: true,
    color: '#0047AB', // Royal blue color for header
    alignment: 'center',
    margin: [0, 10, 0, 20] as [number, number, number, number]
  },
  subheader: {
    fontSize: 16,
    bold: true,
    margin: [0, 10, 0, 5] as [number, number, number, number]
  },
  companyName: {
    fontSize: 16,
    bold: true,
    color: '#0047AB'
  },
  companyAddress: {
    fontSize: 10,
    color: '#333333'
  },
  companyContact: {
    fontSize: 10,
    color: '#333333'
  },
  sectionTitle: {
    fontSize: 12,
    bold: true
  },
  tableHeader: {
    bold: true,
    fontSize: 12,
    color: 'white',
    fillColor: '#0047AB',
    alignment: 'center'
  },
  tableRow: {
    fontSize: 10
  },
  tableRowEven: {
    fontSize: 10,
    fillColor: '#f2f2f2'
  },
  termsHeader: {
    fontSize: 14,
    bold: true,
    margin: [0, 15, 0, 5] as [number, number, number, number]
  },
  termsList: {
    fontSize: 10,
    margin: [0, 2, 0, 2] as [number, number, number, number]
  },
  footer: {
    fontSize: 10,
    italic: true,
    alignment: 'center',
    color: '#0047AB',
    margin: [0, 10, 0, 0] as [number, number, number, number]
  }
};

// Logo image path (served from public folder)
const logoImagePath = "/lovable-uploads/6ee98dbf-b695-4632-976f-50c50bb67d59.png";

// Generate PDF for quotation
export const generateQuotationPdf = (quotation: Quotation): void => {
  try {
    // Create an array for content with non-conditional items first
    const contentItems: any[] = [
      // Header with Logo and Company Name
      {
        columns: [
          // Logo on the left
          {
            image: logoImagePath,
            width: 220,
            alignment: 'left'
          },
          // Spacer
          { width: '*', text: '' },
          // Quotation title on the right
          {
            text: 'QUOTATION',
            style: 'header',
            width: 'auto'
          }
        ]
      },
      
      // Company and client information
      {
        columns: [
          // Company Information
          {
            width: '60%',
            stack: [
              { text: 'United Copier', style: 'companyName' },
              { text: '118, Jaora Compound, Indore', style: 'companyAddress' },
              { text: '81033-49299, 93003-00345', style: 'companyContact' }
            ]
          },
          // Quotation Details
          {
            width: '40%',
            stack: [
              { 
                columns: [
                  { text: 'Quotation No:', style: 'sectionTitle', width: 'auto' },
                  { text: ` ${quotation.quotationNumber}`, width: '*' }
                ]
              },
              { 
                columns: [
                  { text: 'Date:', style: 'sectionTitle', width: 'auto' },
                  { text: ` ${format(new Date(quotation.createdAt), "MMMM dd, yyyy")}`, width: '*' }
                ]
              }
            ]
          }
        ],
        columnGap: 10,
        margin: [0, 20, 0, 20]
      },
      
      // Client Information
      {
        stack: [
          { text: 'Client:', style: 'sectionTitle' },
          { text: `${quotation.customerName}` },
          { text: '123, Business Park, Pune, Maharashtra', margin: [0, 0, 0, 20] }
        ]
      },
      
      // Items Table
      {
        table: {
          headerRows: 1,
          widths: ['*', '*', 'auto', 'auto', 'auto'],
          body: [
            [
              { text: 'Product', style: 'tableHeader' },
              { text: 'Specifications', style: 'tableHeader' },
              { text: 'Qty', style: 'tableHeader' },
              { text: 'Rate (₹)', style: 'tableHeader' },
              { text: 'GST%', style: 'tableHeader' },
              { text: 'Total (₹)', style: 'tableHeader' }
            ],
            ...quotation.items.map((item, index) => [
              { text: item.name, style: index % 2 === 0 ? 'tableRow' : 'tableRowEven' },
              { 
                text: item.description || `${item.specs?.color ? 'Color' : 'B&W'}${item.specs?.speed ? `, ${item.specs.speed}` : ''}${item.specs?.ram ? `, ${item.specs.ram} RAM` : ''}`, 
                style: index % 2 === 0 ? 'tableRow' : 'tableRowEven' 
              },
              { text: item.quantity.toString(), style: index % 2 === 0 ? 'tableRow' : 'tableRowEven', alignment: 'center' },
              { text: `₹${item.unitPrice.toLocaleString()}`, style: index % 2 === 0 ? 'tableRow' : 'tableRowEven', alignment: 'right' },
              { text: `${item.gstPercent}%`, style: index % 2 === 0 ? 'tableRow' : 'tableRowEven', alignment: 'center' },
              { text: `₹${item.total.toLocaleString()}`, style: index % 2 === 0 ? 'tableRow' : 'tableRowEven', alignment: 'right' }
            ])
          ]
        }
      },
      
      // Total Section
      {
        columns: [
          { width: '*', text: '' },
          {
            width: 'auto',
            table: {
              widths: ['auto', 'auto'],
              body: [
                [
                  { text: 'Subtotal:', style: 'sectionTitle', alignment: 'right' },
                  { text: `₹${quotation.subtotal.toLocaleString()}`, alignment: 'right' }
                ],
                [
                  { text: 'GST:', style: 'sectionTitle', alignment: 'right' },
                  { text: `₹${quotation.totalGst.toLocaleString()}`, alignment: 'right' }
                ],
                [
                  { text: 'Grand Total:', style: 'sectionTitle', alignment: 'right' },
                  { text: `₹${quotation.grandTotal.toLocaleString()}`, alignment: 'right', bold: true }
                ]
              ]
            },
            layout: 'noBorders'
          }
        ],
        margin: [0, 15, 0, 15]
      },
      
      // Terms and conditions
      { text: 'Terms & Conditions', style: 'termsHeader' },
      { text: '• Quotation valid for 15 days from the date of issue.', style: 'termsList' },
      { text: '• Delivery within 5-7 business days after confirmation.', style: 'termsList' },
      { text: '• Payment terms: 50% advance, 50% on delivery.', style: 'termsList' },
      { text: '• Warranty: 1 year onsite (from installation date).', style: 'termsList' }
    ];
    
    // Add terms if provided
    if (quotation.terms) {
      contentItems.push({ text: quotation.terms, style: 'termsList', margin: [0, 5, 0, 0] });
    }
    
    // Add notes section if provided
    if (quotation.notes) {
      contentItems.push({ text: 'Notes', style: 'termsHeader' });
      contentItems.push({ text: quotation.notes, style: 'termsList' });
    }
    
    // Add thank you note
    contentItems.push({ text: 'Thank you for choosing United Copier!', style: 'footer', margin: [0, 20, 0, 0] });
    
    const docDefinition: TDocumentDefinitions = {
      pageSize: 'A4',
      pageMargins: [40, 40, 40, 60],
      content: contentItems,
      defaultStyle: {
        font: 'Roboto'
      },
      footer: function(currentPage: number, pageCount: number) {
        return {
          columns: [
            { 
              text: 'United Copier - All Solutions Under A Roof for Printers',
              alignment: 'center',
              margin: [40, 0, 40, 0],
              fontSize: 8,
              color: '#0047AB',
              italics: true
            }
          ]
        };
      }
    };

    const pdfDocGenerator = pdfMake.createPdf(docDefinition);
    pdfDocGenerator.download(`Quotation_${quotation.quotationNumber}.pdf`);
  } catch (error) {
    console.error("PDF generation error:", error);
    throw error;
  }
};

// Generate PDF for purchase order - updated with the same style as quotation
export const generatePurchaseOrderPdf = (order: PurchaseOrder): void => {
  try {
    // Create an array for content with non-conditional items first
    const contentItems: any[] = [
      // Header with Logo and Title
      {
        columns: [
          // Logo on the left
          {
            image: logoImagePath,
            width: 220,
            alignment: 'left'
          },
          // Spacer
          { width: '*', text: '' },
          // PO title on the right
          {
            text: 'PURCHASE ORDER',
            style: 'header',
            width: 'auto'
          }
        ]
      },
      
      // Company and vendor information
      {
        columns: [
          // Company Information
          {
            width: '60%',
            stack: [
              { text: 'United Copier', style: 'companyName' },
              { text: '118, Jaora Compound, Indore', style: 'companyAddress' },
              { text: '81033-49299, 93003-00345', style: 'companyContact' }
            ]
          },
          // PO Details
          {
            width: '40%',
            stack: [
              { 
                columns: [
                  { text: 'PO No:', style: 'sectionTitle', width: 'auto' },
                  { text: ` ${order.poNumber}`, width: '*' }
                ]
              },
              { 
                columns: [
                  { text: 'Date:', style: 'sectionTitle', width: 'auto' },
                  { text: ` ${format(new Date(order.createdAt), "MMMM dd, yyyy")}`, width: '*' }
                ]
              },
              { 
                columns: [
                  { text: 'Delivery Date:', style: 'sectionTitle', width: 'auto' },
                  { text: ` ${format(new Date(order.deliveryDate), "MMMM dd, yyyy")}`, width: '*' }
                ]
              }
            ]
          }
        ],
        columnGap: 10,
        margin: [0, 20, 0, 20]
      },
      
      // Vendor Information
      {
        stack: [
          { text: 'Vendor:', style: 'sectionTitle' },
          { text: `${order.vendorName}` },
          { text: 'Vendor Address', margin: [0, 0, 0, 20] }
        ]
      },
      
      // Items Table
      {
        table: {
          headerRows: 1,
          widths: ['*', '*', 'auto', 'auto', 'auto', 'auto'],
          body: [
            [
              { text: 'Product', style: 'tableHeader' },
              { text: 'Specifications', style: 'tableHeader' },
              { text: 'Qty', style: 'tableHeader' },
              { text: 'Rate (₹)', style: 'tableHeader' },
              { text: 'GST%', style: 'tableHeader' },
              { text: 'Total (₹)', style: 'tableHeader' }
            ],
            ...order.items.map((item, index) => [
              { text: item.name, style: index % 2 === 0 ? 'tableRow' : 'tableRowEven' },
              { 
                text: item.description || `${item.specs?.color ? 'Color' : 'B&W'}${item.specs?.speed ? `, ${item.specs.speed}` : ''}${item.specs?.ram ? `, ${item.specs.ram} RAM` : ''}`, 
                style: index % 2 === 0 ? 'tableRow' : 'tableRowEven' 
              },
              { text: item.quantity.toString(), style: index % 2 === 0 ? 'tableRow' : 'tableRowEven', alignment: 'center' },
              { text: `₹${item.unitPrice.toLocaleString()}`, style: index % 2 === 0 ? 'tableRow' : 'tableRowEven', alignment: 'right' },
              { text: `${item.gstPercent}%`, style: index % 2 === 0 ? 'tableRow' : 'tableRowEven', alignment: 'center' },
              { text: `₹${item.total.toLocaleString()}`, style: index % 2 === 0 ? 'tableRow' : 'tableRowEven', alignment: 'right' }
            ])
          ]
        }
      },
      
      // Total Section
      {
        columns: [
          { width: '*', text: '' },
          {
            width: 'auto',
            table: {
              widths: ['auto', 'auto'],
              body: [
                [
                  { text: 'Subtotal:', style: 'sectionTitle', alignment: 'right' },
                  { text: `₹${order.subtotal.toLocaleString()}`, alignment: 'right' }
                ],
                [
                  { text: 'GST:', style: 'sectionTitle', alignment: 'right' },
                  { text: `₹${order.totalGst.toLocaleString()}`, alignment: 'right' }
                ],
                [
                  { text: 'Grand Total:', style: 'sectionTitle', alignment: 'right' },
                  { text: `₹${order.grandTotal.toLocaleString()}`, alignment: 'right', bold: true }
                ]
              ]
            },
            layout: 'noBorders'
          }
        ],
        margin: [0, 15, 0, 15]
      },
      
      // Terms and conditions
      { text: 'Terms & Conditions', style: 'termsHeader' },
      { text: '• Standard terms and conditions apply.', style: 'termsList' },
      { text: '• Delivery expected within the timeframe specified above.', style: 'termsList' }
    ];
    
    // Add terms if provided
    if (order.terms) {
      contentItems.push({ text: order.terms, style: 'termsList', margin: [0, 5, 0, 0] });
    }
    
    // Add notes section if provided
    if (order.notes) {
      contentItems.push({ text: 'Notes', style: 'termsHeader' });
      contentItems.push({ text: order.notes, style: 'termsList' });
    }
    
    // Add thank you note
    contentItems.push({ text: 'Thank you for your business!', style: 'footer', margin: [0, 20, 0, 0] });
    
    const docDefinition: TDocumentDefinitions = {
      pageSize: 'A4',
      pageMargins: [40, 40, 40, 60],
      content: contentItems,
      defaultStyle: {
        font: 'Roboto'
      },
      footer: function(currentPage: number, pageCount: number) {
        return {
          columns: [
            { 
              text: 'United Copier - All Solutions Under A Roof for Printers',
              alignment: 'center',
              margin: [40, 0, 40, 0],
              fontSize: 8,
              color: '#0047AB',
              italics: true
            }
          ]
        };
      }
    };

    const pdfDocGenerator = pdfMake.createPdf(docDefinition);
    pdfDocGenerator.download(`PO_${order.poNumber}.pdf`);
  } catch (error) {
    console.error("PDF generation error:", error);
    throw error;
  }
};
