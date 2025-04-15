
// Define proper company info type
export interface CompanyInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  contact: string;
  gstin: string;
  bankName: string;
  accountNo: string;
  ifsc: string;
  branch: string;
}

// Set logo to an empty string - we'll have a text fallback
export const logoBase64 = "";

// Company information
export const companyInfo: CompanyInfo = {
  name: "United Copiers",
  address: "Your Company Address",
  phone: "Your Phone Number",
  email: "your@email.com",
  website: "www.yourwebsite.com",
  contact: "Your Contact Person",
  gstin: "Your GSTIN Number",
  bankName: "Your Bank Name",
  accountNo: "Your Account Number",
  ifsc: "Your IFSC Code",
  branch: "Your Branch Name"
};
