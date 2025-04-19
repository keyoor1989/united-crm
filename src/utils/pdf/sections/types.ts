
import { Content } from "pdfmake/interfaces";

export interface ContentWithStack {
  stack: Content[];
}

export interface TextWithMargin {
  text: string;
  margin?: [number, number, number, number];
  style?: string;
  alignment?: string;
  fontSize?: number;
}

export interface DetailItem {
  label: string;
  value: string | number;
}
