import { format } from "date-fns";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { TDocumentDefinitions } from "pdfmake/interfaces";

// Initialize pdfMake with fonts
pdfMake.vfs = pdfFonts.pdfMake ? pdfFonts.pdfMake.vfs : pdfFonts.vfs;

export const exportToCsv = (data: any[], fileName: string) => {
  if (!data || !data.length) {
    console.error('No data to export');
    return;
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);
  
  // Convert data to CSV format
  const csvContent = [
    headers.join(','), // Header row
    ...data.map(row => 
      headers.map(field => {
        let value = row[field]?.toString() || '';
        // Escape commas and quotes for CSV
        if (value.includes(',') || value.includes('"')) {
          value = `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');
  
  // Create a download link
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${fileName}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToPdf = (data: any[], title: string) => {
  if (!data || !data.length) {
    console.error('No data to export');
    return;
  }

  // Define columns for the PDF table
  const columns = Object.keys(data[0]).map(key => ({
    text: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
    style: 'tableHeader'
  }));

  // Prepare rows for the PDF table
  const rows = data.map(item => Object.values(item).map(value => ({ text: String(value) })));

  // PDF document definition
  const docDefinition: TDocumentDefinitions = {
    content: [
      { text: title, style: 'header' },
      { text: `Generated on: ${format(new Date(), 'PPP')}`, style: 'subheader' },
      {
        table: {
          headerRows: 1,
          widths: Array(columns.length).fill('*'),
          body: [columns, ...rows]
        },
        layout: {
          fillColor: function(rowIndex) {
            return (rowIndex % 2 === 0) ? '#f9fafb' : null;
          }
        }
      }
    ],
    styles: {
      header: {
        fontSize: 18,
        bold: true,
        margin: [0, 0, 0, 10]
      },
      subheader: {
        fontSize: 12,
        bold: false,
        margin: [0, 0, 0, 10]
      },
      tableHeader: {
        bold: true,
        fontSize: 12,
        color: 'black',
        fillColor: '#e5e7eb'
      }
    },
    defaultStyle: {
      fontSize: 10
    }
  };

  // Generate and download PDF
  pdfMake.createPdf(docDefinition).download(`${title.replace(/\s+/g, '_')}.pdf`);
};
