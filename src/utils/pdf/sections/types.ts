
import { Content, Style, ContentText } from "pdfmake/interfaces";

// Extend ContentText to include margin and style properties
export interface TextWithMargin extends ContentText {
  margin?: [number, number, number, number];
  style?: string;
  alignment?: 'left' | 'center' | 'right' | 'justify';
  fontSize?: number;
}

// Helper interface for stacked content
export interface ContentWithStack {
  stack: Content[];
}

export interface DetailItem {
  label: string;
  value: string | number;
}
