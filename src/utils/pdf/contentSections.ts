
// Re-export all section functions from their respective files
export { createDocumentHeader } from './sections/headerSection';
export { createDocumentDetails, createEntityInfoSection } from './sections/infoSections';
export { createTotalsSection, createBankDetailsSection } from './sections/valueSections';
export { 
  createTermsSection, 
  createNotesSection, 
  createThankYouNote,
  createSignatureSection 
} from './sections/additionalSections';

// Re-export types if needed for external consumers
export type { ContentWithStack, TextWithMargin, DetailItem } from './sections/types';
