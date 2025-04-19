
import { Content, ContentText, Style } from "pdfmake/interfaces";

// Define alignment type to match pdfmake expectations
export type PdfAlignment = 'left' | 'center' | 'right' | 'justify';

// Extend ContentText to include margin and style properties
export interface TextWithMargin extends ContentText {
  margin?: [number, number, number, number];
  style?: string;
  alignment?: PdfAlignment;
  fontSize?: number;
  fillColor?: string;
}

// Extend the existing types to support more dynamic cell properties
export interface PdfTableCell {
  text: string | number;
  fillColor?: string;
  style?: string;
  alignment?: PdfAlignment;
}

// Helper interface for stacked content
export interface ContentWithStack {
  stack: Content[];
}

export interface DetailItem {
  label: string;
  value: string | number;
}

// Define ItemsTableOptions interface for createItemsTable function
export interface ItemsTableOptions {
  alternateRowColors?: boolean;
  showItemNumbers?: boolean;
}

