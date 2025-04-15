
import { Content, ContentText } from "pdfmake/interfaces";
import { DetailItem, ContentWithStack, TextWithMargin } from "./types";

// Create document details section (date, number, etc.)
export const createDocumentDetails = (details: DetailItem[]): ContentWithStack => {
  const stackItems: Content[] = details.map(detail => ({ 
    columns: [
      { text: `${detail.label}:`, style: 'sectionTitle', width: 'auto' },
      { text: ` ${detail.value}`, width: '*' }
    ]
  }));
  
  return {
    stack: stackItems
  };
};

// Create client/vendor information section
export const createEntityInfoSection = (
  label: string, 
  name: string, 
  address?: string
): ContentWithStack => {
  const infoStack: (ContentText | TextWithMargin)[] = [
    { text: `${label}:`, style: 'sectionTitle', margin: [0, 0, 0, 2] },
    { text: name, margin: [0, 0, 0, 2] }
  ];
  
  if (address) {
    infoStack.push({ 
      text: address, 
      margin: [0, 0, 0, 10],
      fontSize: 9 
    } as TextWithMargin);
  } else {
    infoStack.push({ 
      text: '', 
      margin: [0, 0, 0, 10]
    } as TextWithMargin);
  }
  
  return { stack: infoStack };
};
