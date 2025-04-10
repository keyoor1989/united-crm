
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
    margin: [0, 0, 0, 10] as [number, number, number, number]
  },
  subheader: {
    fontSize: 16,
    bold: true,
    margin: [0, 10, 0, 5] as [number, number, number, number]
  },
  tableHeader: {
    bold: true,
    fontSize: 13,
    color: 'black'
  },
  metaLabel: {
    fontSize: 12,
    bold: true
  },
  metaValue: {
    fontSize: 12
  }
};

// Logo image path (served from public folder)
const logoImagePath = "/lovable-uploads/6ee98dbf-b695-4632-976f-50c50bb67d59.png";

// Generate PDF for quotation
export const generateQuotationPdf = (quotation: Quotation): void => {
  try {
    const docDefinition: TDocumentDefinitions = {
      content: [
        {
          columns: [
            {
              image: logoImagePath,
              width: 200,
              margin: [0, 0, 0, 20]
            },
            {
              text: 'QUOTATION',
              style: 'header',
              alignment: 'right',
              margin: [0, 20, 0, 0]
            }
          ]
        },
        {
          columns: [
            [
              { text: 'Quotation #:', style: 'metaLabel' },
              { text: 'Date:', style: 'metaLabel' },
              { text: 'Valid Until:', style: 'metaLabel' }
            ],
            [
              { text: quotation.quotationNumber, style: 'metaValue' },
              { text: format(new Date(quotation.createdAt), "MMM dd, yyyy"), style: 'metaValue' },
              { text: format(new Date(quotation.validUntil), "MMM dd, yyyy"), style: 'metaValue' }
            ],
            [
              { text: 'Status:', style: 'metaLabel' },
              { text: 'Customer:', style: 'metaLabel' }
            ],
            [
              { text: quotation.status, style: 'metaValue' },
              { text: quotation.customerName, style: 'metaValue' }
            ]
          ]
        },
        { text: 'Items', style: 'subheader' },
        {
          table: {
            headerRows: 1,
            widths: ['*', 'auto', 'auto', 'auto', 'auto'],
            body: [
              [
                { text: 'Item Description', style: 'tableHeader' },
                { text: 'Quantity', style: 'tableHeader' },
                { text: 'Unit Price (₹)', style: 'tableHeader' },
                { text: 'GST (%)', style: 'tableHeader' },
                { text: 'Amount (₹)', style: 'tableHeader' }
              ],
              ...quotation.items.map(item => [
                item.name,
                item.quantity.toString(),
                item.unitPrice.toLocaleString(),
                item.gstPercent.toString(),
                item.total.toLocaleString()
              ])
            ]
          }
        },
        {
          columns: [
            { width: '*', text: '' },
            {
              width: 'auto',
              table: {
                body: [
                  ['Subtotal:', `₹${quotation.subtotal.toLocaleString()}`],
                  ['GST:', `₹${quotation.totalGst.toLocaleString()}`],
                  ['Grand Total:', `₹${quotation.grandTotal.toLocaleString()}`]
                ]
              },
              layout: 'noBorders'
            }
          ],
          margin: [0, 20, 0, 0] as [number, number, number, number]
        },
        { text: 'Terms & Conditions', style: 'subheader' },
        { text: quotation.terms || 'Standard terms and conditions apply.' },
        { text: 'Notes', style: 'subheader' },
        { text: quotation.notes || 'No additional notes.' }
      ],
      styles: styles,
      defaultStyle: {
        font: 'Roboto'
      },
      footer: function(currentPage: number, pageCount: number) {
        return {
          columns: [
            { 
              text: 'United Copier - All Solutions Under A Roof for Printers',
              alignment: 'left',
              margin: [40, 0, 0, 0],
              fontSize: 8,
              color: '#666666'
            },
            { 
              text: `Page ${currentPage} of ${pageCount}`,
              alignment: 'right',
              margin: [0, 0, 40, 0],
              fontSize: 8,
              color: '#666666'
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

// Generate PDF for purchase order
export const generatePurchaseOrderPdf = (order: PurchaseOrder): void => {
  const docDefinition: TDocumentDefinitions = {
    content: [
      {
        columns: [
          {
            image: logoImagePath,
            width: 200,
            margin: [0, 0, 0, 20]
          },
          {
            text: 'PURCHASE ORDER',
            style: 'header',
            alignment: 'right',
            margin: [0, 20, 0, 0]
          }
        ]
      },
      {
        columns: [
          [
            { text: 'PO #:', style: 'metaLabel' },
            { text: 'Date:', style: 'metaLabel' },
            { text: 'Delivery Date:', style: 'metaLabel' }
          ],
          [
            { text: order.poNumber, style: 'metaValue' },
            { text: format(new Date(order.createdAt), "MMM dd, yyyy"), style: 'metaValue' },
            { text: format(new Date(order.deliveryDate), "MMM dd, yyyy"), style: 'metaValue' }
          ],
          [
            { text: 'Status:', style: 'metaLabel' },
            { text: 'Vendor:', style: 'metaLabel' }
          ],
          [
            { text: order.status, style: 'metaValue' },
            { text: order.vendorName, style: 'metaValue' }
          ]
        ]
      },
      { text: 'Items', style: 'subheader' },
      {
        table: {
          headerRows: 1,
          widths: ['*', 'auto', 'auto', 'auto', 'auto'],
          body: [
            [
              { text: 'Item Description', style: 'tableHeader' },
              { text: 'Quantity', style: 'tableHeader' },
              { text: 'Unit Price (₹)', style: 'tableHeader' },
              { text: 'GST (%)', style: 'tableHeader' },
              { text: 'Amount (₹)', style: 'tableHeader' }
            ],
            ...order.items.map(item => [
              item.name,
              item.quantity.toString(),
              item.unitPrice.toLocaleString(),
              item.gstPercent.toString(),
              item.total.toLocaleString()
            ])
          ]
        }
      },
      {
        columns: [
          { width: '*', text: '' },
          {
            width: 'auto',
            table: {
              body: [
                ['Subtotal:', `₹${order.subtotal.toLocaleString()}`],
                ['GST:', `₹${order.totalGst.toLocaleString()}`],
                ['Grand Total:', `₹${order.grandTotal.toLocaleString()}`]
              ]
            },
            layout: 'noBorders'
          }
        ],
        margin: [0, 20, 0, 0] as [number, number, number, number]
      },
      { text: 'Terms & Conditions', style: 'subheader' },
      { text: order.terms || 'Standard terms and conditions apply.' },
      { text: 'Notes', style: 'subheader' },
      { text: order.notes || 'No additional notes.' }
    ],
    styles: styles,
    defaultStyle: {
      font: 'Roboto'
    },
    footer: function(currentPage: number, pageCount: number) {
      return {
        columns: [
          { 
            text: 'United Copier - All Solutions Under A Roof for Printers',
            alignment: 'left',
            margin: [40, 0, 0, 0],
            fontSize: 8,
            color: '#666666'
          },
          { 
            text: `Page ${currentPage} of ${pageCount}`,
            alignment: 'right',
            margin: [0, 0, 40, 0],
            fontSize: 8,
            color: '#666666'
          }
        ]
      };
    }
  };

  const pdfDocGenerator = pdfMake.createPdf(docDefinition);
  pdfDocGenerator.download(`PO_${order.poNumber}.pdf`);
};
