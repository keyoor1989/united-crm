
import React, { createContext, useState, useContext, ReactNode } from "react";
import { Vendor } from "@/types/inventory";

// Mock vendors data as initial state
const initialVendors: Vendor[] = [
  {
    id: "vendor1",
    name: "Ajanta Traders",
    gstNo: "24AAKCS9636Q1ZX",
    phone: "9876543210",
    email: "info@ajanta.com",
    address: "142, Industrial Area, Indore, MP",
    createdAt: "2024-01-15"
  },
  {
    id: "vendor2",
    name: "Ravi Distributors",
    gstNo: "27AAVCS8142M1Z5",
    phone: "9988776655",
    email: "sales@ravidist.com",
    address: "78, Tech Park, Bhopal, MP",
    createdAt: "2024-02-20"
  },
  {
    id: "vendor3",
    name: "Mehta Enterprises",
    gstNo: "06AABCU9603R1ZP",
    phone: "9865432109",
    email: "contact@mehta.co.in",
    address: "23, Old Market, Jabalpur, MP",
    createdAt: "2023-11-05"
  },
  {
    id: "vendor4",
    name: "Global Supplies",
    gstNo: "29AAKCG1412Q1Z5",
    phone: "9889900001",
    email: "info@globalsupplies.com",
    address: "56, MG Road, Indore, MP",
    createdAt: "2024-03-12"
  },
  {
    id: "vendor5",
    name: "Tech Parts Ltd",
    gstNo: "23AADFT2613R1ZM",
    phone: "9870123456",
    email: "support@techparts.in",
    address: "110, Industrial Estate, Pithampur, MP",
    createdAt: "2023-12-10"
  },
];

// Create the context
type VendorContextType = {
  vendors: Vendor[];
  addVendor: (vendor: Vendor) => void;
  updateVendor: (updatedVendor: Vendor) => void;
  deleteVendor: (vendorId: string) => void;
};

const VendorContext = createContext<VendorContextType | undefined>(undefined);

// Create a provider component
export const VendorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [vendors, setVendors] = useState<Vendor[]>(initialVendors);

  const addVendor = (vendor: Vendor) => {
    setVendors((prevVendors) => [...prevVendors, vendor]);
  };

  const updateVendor = (updatedVendor: Vendor) => {
    setVendors((prevVendors) =>
      prevVendors.map((vendor) =>
        vendor.id === updatedVendor.id ? updatedVendor : vendor
      )
    );
  };

  const deleteVendor = (vendorId: string) => {
    setVendors((prevVendors) =>
      prevVendors.filter((vendor) => vendor.id !== vendorId)
    );
  };

  return (
    <VendorContext.Provider value={{ vendors, addVendor, updateVendor, deleteVendor }}>
      {children}
    </VendorContext.Provider>
  );
};

// Create a hook to use the context
export const useVendors = () => {
  const context = useContext(VendorContext);
  if (context === undefined) {
    throw new Error("useVendors must be used within a VendorProvider");
  }
  return context;
};
