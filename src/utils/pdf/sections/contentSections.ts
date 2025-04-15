
// Re-export all section functions from their respective files
export { createDocumentHeader } from './headerSection';
export { createDocumentDetails, createEntityInfoSection } from './infoSections';
export { createTotalsSection, createBankDetailsSection } from './valueSections';
export { 
  createTermsSection, 
  createNotesSection, 
  createThankYouNote,
  createSignatureSection 
} from './additionalSections';

// Re-export types if needed for external consumers
export type { ContentWithStack, TextWithMargin, DetailItem } from './types';
