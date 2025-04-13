
import { format } from "date-fns";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

// Initialize pdfMake with fonts
// Handle different possible structures of pdfFonts
pdfMake.vfs = (pdfFonts as any).pdfMake?.vfs || (pdfFonts as any).vfs;

export const exportToCsv = <T extends Record<string, any>>(
  data: T[],
  fileName: string
) => {
  if (!data.length) return;

  // Get headers from first data object
  const headers = Object.keys(data[0]);
  
  // Convert data to CSV rows
  const csvRows = [];
  
  // Add headers row
  csvRows.push(headers.join(','));
  
  // Add data rows
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      // Handle special cases (null, undefined, etc.)
      if (value === null || value === undefined) return '';
      // Wrap strings with commas in quotes
      return typeof value === 'string' && (value.includes(',') || value.includes('"'))
        ? `"${value.replace(/"/g, '""')}"`
        : String(value);
    });
    csvRows.push(values.join(','));
  }
  
  // Create CSV content
  const csvContent = csvRows.join('\n');
  
  // Create download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${fileName}-${format(new Date(), 'yyyy-MM-dd')}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToPdf = <T extends Record<string, any>>(
  data: T[],
  title: string
) => {
  if (!data.length) return;

  // Get headers from first data object and format them for PDF
  const headers = Object.keys(data[0]).map(key => ({
    text: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
    style: 'tableHeader'
  }));
  
  // Convert data to PDF rows
  const rows = data.map(row => 
    Object.values(row).map(value => ({ text: String(value) }))
  );
  
  // Define the document definition
  const docDefinition = {
    content: [
      {
        text: title,
        style: 'header',
      },
      {
        text: `Generated on: ${format(new Date(), 'PPPP')}`,
        style: 'subheader',
      },
      {
        text: '',
        margin: [0, 10],
      },
      {
        table: {
          headerRows: 1,
          widths: Array(headers.length).fill('*'),
          body: [headers, ...rows],
        },
      },
    ],
    styles: {
      header: {
        fontSize: 18,
        bold: true,
        margin: [0, 0, 0, 10],
      },
      subheader: {
        fontSize: 12,
        italics: true,
        margin: [0, 5, 0, 5],
      },
      tableHeader: {
        bold: true,
        fillColor: '#eeeeee',
      },
    },
    defaultStyle: {
      fontSize: 10,
    },
  };
  
  // Generate PDF and download
  pdfMake.createPdf(docDefinition as any).download(`${title}-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
};
