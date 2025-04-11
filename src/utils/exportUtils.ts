
import { format } from 'date-fns';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { TDocumentDefinitions } from 'pdfmake/interfaces';

// Initialize pdfMake - fix the reference to vfs
pdfMake.vfs = pdfFonts.pdfMake?.vfs || {};

/**
 * Export data to CSV file
 */
export const exportToCsv = (data: any[], filename: string) => {
  if (!data || !data.length) {
    console.error('No data to export');
    return;
  }

  // Get headers from the first data item
  const headers = Object.keys(data[0]).filter(key => 
    key !== 'id' && key !== 'enteredBy' && key !== 'category'
  );
  
  // Create CSV rows
  const csvRows = [];
  
  // Add headers
  const headerRow = headers.map(header => {
    // Capitalize first letter and replace camelCase with spaces
    return header.charAt(0).toUpperCase() + 
      header.slice(1).replace(/([A-Z])/g, ' $1');
  });
  csvRows.push(headerRow.join(','));
  
  // Add data rows
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      const valueString = value === null || value === undefined ? '' : value.toString();
      // Escape quotes and wrap in quotes if contains comma
      return valueString.includes(',') ? `"${valueString.replace(/"/g, '""')}"` : valueString;
    });
    csvRows.push(values.join(','));
  }
  
  // Create Blob and download
  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${format(new Date(), 'yyyy-MM-dd')}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Export data to PDF file
 */
export const exportToPdf = (data: any[], title: string) => {
  if (!data || !data.length) {
    console.error('No data to export');
    return;
  }

  // Get headers from the first data item (excluding id)
  const headers = Object.keys(data[0]).filter(key => 
    key !== 'id' && key !== 'enteredBy' && key !== 'category'
  );
  
  // Format headers for display
  const formattedHeaders = headers.map(header => ({
    text: header.charAt(0).toUpperCase() + header.slice(1).replace(/([A-Z])/g, ' $1'),
    style: 'tableHeader'
  }));
  
  // Format data for PDF
  const bodyData = data.map(row => {
    return headers.map(header => {
      let value = row[header];
      
      // Format specific fields
      if (header === 'amount') {
        value = new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR'
        }).format(value);
      } else if (header === 'type') {
        value = value === 'Income' ? 'Cash In' : 'Cash Out';
      }
      
      return { 
        text: value?.toString() || '', 
        style: header === 'type' ? (value === 'Cash In' ? 'income' : 'expense') : '' 
      };
    });
  });
  
  // Create document definition
  const docDefinition: TDocumentDefinitions = {
    content: [
      { text: title, style: 'header' },
      { text: `Generated on ${format(new Date(), 'PPP')}`, style: 'subheader' },
      {
        table: {
          headerRows: 1,
          widths: Array(headers.length).fill('*'),
          body: [formattedHeaders, ...bodyData]
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
        margin: [0, 0, 0, 20]
      },
      tableHeader: {
        bold: true,
        fontSize: 12,
        color: 'black',
        fillColor: '#f2f2f2'
      },
      income: {
        color: 'green'
      },
      expense: {
        color: 'red'
      }
    },
    defaultStyle: {
      fontSize: 10
    }
  };
  
  // Generate and download PDF
  pdfMake.createPdf(docDefinition).download(`${title.toLowerCase().replace(/\s+/g, '_')}_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
};
