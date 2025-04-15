
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

// Company information with updated details
export const companyInfo: CompanyInfo = {
  name: "United Copiers",
  address: "118, Jaora Compound, Indore",
  phone: "81033-49299, 93003-00345",
  email: "unitedcopierindore@gmail.com",
  website: "unitedcopier.in",
  contact: "United Copier",
  gstin: "23AAZPY6466B1Z2",
  bankName: "ICICI Bank",
  accountNo: "657405601659",
  ifsc: "ICIC0006574",
  branch: "UshaGanj, Indore"
};
