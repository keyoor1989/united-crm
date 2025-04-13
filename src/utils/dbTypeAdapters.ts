/**
 * Utility functions for converting between database (snake_case) 
 * and frontend (camelCase) data formats
 */

import { 
  Vendor, 
  AMCMachine, 
  AMCContract, 
  AMCBilling, 
  AMCConsumableUsage,
  DbAMCMachine,
  DbAMCContract,
  DbAMCBilling 
} from "@/types/inventory";
import { PurchaseOrder, PurchaseOrderItem } from "@/types/sales";

// Database to Frontend conversion utilities
export const dbAdapters = {
  // Vendor adapter
  adaptVendor: (dbVendor: any): Vendor => ({
    id: dbVendor.id,
    name: dbVendor.name,
    contactPerson: dbVendor.contact_person || "",
    email: dbVendor.email || "",
    phone: dbVendor.phone || "",
    address: dbVendor.address || "",
    gstNo: dbVendor.gst_no || "",
    createdAt: dbVendor.created_at
  }),

  // AMC Machine adapter
  adaptAMCMachine: (dbMachine: DbAMCMachine): AMCMachine => ({
    id: dbMachine.id,
    contractId: dbMachine.contract_id,
    customerId: dbMachine.customer_id,
    customerName: dbMachine.customer_name,
    serialNumber: dbMachine.serial_number,
    machineType: dbMachine.machine_type,
    model: dbMachine.model,
    location: dbMachine.location,
    department: dbMachine.department,
    currentRent: dbMachine.current_rent,
    copyLimitA4: dbMachine.copy_limit_a4,
    copyLimitA3: dbMachine.copy_limit_a3,
    lastA4Reading: dbMachine.last_a4_reading,
    lastA3Reading: dbMachine.last_a3_reading,
    lastReadingDate: dbMachine.last_reading_date,
    startDate: dbMachine.start_date,
    endDate: dbMachine.end_date,
    contractType: dbMachine.contract_type,
    createdAt: dbMachine.created_at
  }),
  
  // AMC Contract adapter
  adaptAMCContract: (dbContract: DbAMCContract): AMCContract => ({
    id: dbContract.id,
    customerId: dbContract.customer_id,
    customerName: dbContract.customer_name,
    startDate: dbContract.start_date,
    endDate: dbContract.end_date,
    contractType: dbContract.contract_type,
    status: dbContract.status,
    monthlyRent: dbContract.monthly_rent,
    gstPercent: dbContract.gst_percent,
    copyLimitA4: dbContract.copy_limit_a4,
    copyLimitA3: dbContract.copy_limit_a3,
    extraA4CopyCharge: dbContract.extra_a4_copy_charge,
    extraA3CopyCharge: dbContract.extra_a3_copy_charge,
    billingCycle: dbContract.billing_cycle,
    notes: dbContract.notes,
    location: dbContract.location,
    department: dbContract.department,
    createdAt: dbContract.created_at
  }),
  
  // AMC Billing adapter
  adaptAMCBilling: (dbBilling: DbAMCBilling): AMCBilling => ({
    id: dbBilling.id,
    contractId: dbBilling.contract_id,
    machineId: dbBilling.machine_id,
    customerId: dbBilling.customer_id,
    customerName: dbBilling.customer_name,
    department: dbBilling.department,
    serialNumber: dbBilling.serial_number,
    machineType: dbBilling.machine_type,
    machineModel: dbBilling.machine_model,
    billingMonth: dbBilling.billing_month,
    billDate: dbBilling.bill_date,
    a4OpeningReading: dbBilling.a4_opening_reading,
    a4ClosingReading: dbBilling.a4_closing_reading,
    a4TotalCopies: dbBilling.a4_total_copies,
    a4FreeCopies: dbBilling.a4_free_copies,
    a4ExtraCopies: dbBilling.a4_extra_copies,
    a4ExtraCopyRate: dbBilling.a4_extra_copy_rate,
    a4ExtraCopyCharge: dbBilling.a4_extra_copy_charge,
    a3OpeningReading: dbBilling.a3_opening_reading || 0,
    a3ClosingReading: dbBilling.a3_closing_reading || 0,
    a3TotalCopies: dbBilling.a3_total_copies || 0,
    a3FreeCopies: dbBilling.a3_free_copies || 0,
    a3ExtraCopies: dbBilling.a3_extra_copies || 0,
    a3ExtraCopyRate: dbBilling.a3_extra_copy_rate || 0,
    a3ExtraCopyCharge: dbBilling.a3_extra_copy_charge || 0,
    rent: dbBilling.rent,
    gstPercent: dbBilling.gst_percent,
    gstAmount: dbBilling.gst_amount,
    rentGst: dbBilling.rent_gst,
    totalBill: dbBilling.total_bill,
    billStatus: dbBilling.bill_status,
    invoiceNo: dbBilling.invoice_no,
    createdAt: dbBilling.created_at
  }),
  
  // AMC Consumable Usage adapter
  adaptAMCConsumableUsage: (dbUsage: any): AMCConsumableUsage => ({
    id: dbUsage.id,
    contractId: dbUsage.contract_id,
    machineId: dbUsage.machine_id,
    customerId: dbUsage.customer_id,
    customerName: dbUsage.customer_name,
    department: dbUsage.department,
    serialNumber: dbUsage.serial_number,
    machineType: dbUsage.machine_type,
    machineModel: dbUsage.machine_model,
    date: dbUsage.date,
    itemId: dbUsage.item_id,
    itemName: dbUsage.item_name,
    quantity: dbUsage.quantity,
    cost: dbUsage.cost,
    engineerId: dbUsage.engineer_id,
    engineerName: dbUsage.engineer_name,
    inventoryDeducted: dbUsage.inventory_deducted,
    remarks: dbUsage.remarks,
    createdAt: dbUsage.created_at
  }),
  
  // Purchase Order adapter with safe JSON handling
  adaptPurchaseOrder: (dbOrder: any): PurchaseOrder => ({
    id: dbOrder.id,
    poNumber: dbOrder.po_number,
    vendorId: dbOrder.vendor_id || '',
    vendorName: dbOrder.vendor_name,
    items: Array.isArray(dbOrder.items) 
      ? dbOrder.items as PurchaseOrderItem[] 
      : (JSON.parse(JSON.stringify(dbOrder.items || '[]')) as PurchaseOrderItem[]),
    subtotal: dbOrder.subtotal,
    totalGst: dbOrder.total_gst,
    grandTotal: dbOrder.grand_total,
    createdAt: dbOrder.created_at,
    deliveryDate: dbOrder.delivery_date || '',
    status: dbOrder.status,
    notes: dbOrder.notes || '',
    terms: dbOrder.terms || ''
  })
};

// Frontend to Database conversion utilities
export const frontendAdapters = {
  // Vendor adapter
  adaptVendorToDb: (vendor: Partial<Vendor>): Record<string, any> => {
    const dbVendor: Record<string, any> = {};
    
    if (vendor.name !== undefined) dbVendor.name = vendor.name;
    if (vendor.contactPerson !== undefined) dbVendor.contact_person = vendor.contactPerson;
    if (vendor.email !== undefined) dbVendor.email = vendor.email;
    if (vendor.phone !== undefined) dbVendor.phone = vendor.phone;
    if (vendor.address !== undefined) dbVendor.address = vendor.address;
    if (vendor.gstNo !== undefined) dbVendor.gst_no = vendor.gstNo;
    
    return dbVendor;
  },
  
  // AMC Machine adapter
  adaptAMCMachineToDb: (machine: Partial<AMCMachine>): Record<string, any> => {
    const dbMachine: Record<string, any> = {};
    
    if (machine.contractId !== undefined) dbMachine.contract_id = machine.contractId;
    if (machine.customerId !== undefined) dbMachine.customer_id = machine.customerId;
    if (machine.customerName !== undefined) dbMachine.customer_name = machine.customerName;
    if (machine.serialNumber !== undefined) dbMachine.serial_number = machine.serialNumber;
    if (machine.machineType !== undefined) dbMachine.machine_type = machine.machineType;
    if (machine.model !== undefined) dbMachine.model = machine.model;
    if (machine.location !== undefined) dbMachine.location = machine.location;
    if (machine.department !== undefined) dbMachine.department = machine.department;
    if (machine.currentRent !== undefined) dbMachine.current_rent = machine.currentRent;
    if (machine.copyLimitA4 !== undefined) dbMachine.copy_limit_a4 = machine.copyLimitA4;
    if (machine.copyLimitA3 !== undefined) dbMachine.copy_limit_a3 = machine.copyLimitA3;
    if (machine.lastA4Reading !== undefined) dbMachine.last_a4_reading = machine.lastA4Reading;
    if (machine.lastA3Reading !== undefined) dbMachine.last_a3_reading = machine.lastA3Reading;
    if (machine.lastReadingDate !== undefined) dbMachine.last_reading_date = machine.lastReadingDate;
    if (machine.startDate !== undefined) dbMachine.start_date = machine.startDate;
    if (machine.endDate !== undefined) dbMachine.end_date = machine.endDate;
    if (machine.contractType !== undefined) dbMachine.contract_type = machine.contractType;
    
    return dbMachine;
  }
};
