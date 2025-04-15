
import { Content, ContentText } from "pdfmake/interfaces";
import { PdfMargin } from "../pdfConfig";

// Interface for text with margin
export interface TextWithMargin extends ContentText {
  margin?: PdfMargin;
}

// Type for content objects that have a stack property
export interface ContentWithStack {
  stack: (ContentText | TextWithMargin | Content)[];
  margin?: PdfMargin;
}

// Detail object interface
export interface DetailItem {
  label: string;
  value: string;
}
