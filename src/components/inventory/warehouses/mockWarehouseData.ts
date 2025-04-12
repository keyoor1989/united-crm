
import { Warehouse, WarehouseStock } from "@/types/inventory";

// Mock warehouse data
export const mockWarehouses: Warehouse[] = [
  {
    id: "w1",
    name: "Main Warehouse",
    code: "MW001",
    location: "Chennai",
    address: "123 Main Street, Chennai, 600001",
    contactPerson: "Raj Kumar",
    contactPhone: "+91-9988776655",
    isActive: true,
    createdAt: "2023-01-15T08:30:00"
  },
  {
    id: "w2",
    name: "Bangalore Depot",
    code: "BD002",
    location: "Bangalore",
    address: "456 Tech Park, Bangalore, 560001",
    contactPerson: "Priya Singh",
    contactPhone: "+91-9977665544",
    isActive: true,
    createdAt: "2023-02-20T10:15:00"
  },
  {
    id: "w3",
    name: "Mumbai Storage",
    code: "MS003",
    location: "Mumbai",
    address: "789 Harbor Road, Mumbai, 400001",
    contactPerson: "Amit Patel",
    contactPhone: "+91-9966554433",
    isActive: false,
    createdAt: "2023-03-10T09:00:00"
  },
  {
    id: "w4",
    name: "Delhi Distribution Center",
    code: "DD004",
    location: "Delhi",
    address: "101 Capital Avenue, Delhi, 110001",
    contactPerson: "Deepa Sharma",
    contactPhone: "+91-9955443322",
    isActive: true,
    createdAt: "2023-04-05T11:30:00"
  }
];

// Mock warehouse stock data
export const mockWarehouseStock: WarehouseStock[] = [
  {
    id: "s1",
    warehouseId: "w1",
    itemId: "item1",
    quantity: 150,
    lastUpdated: "2023-05-10T14:30:00"
  },
  {
    id: "s2",
    warehouseId: "w1",
    itemId: "item2",
    quantity: 75,
    lastUpdated: "2023-05-11T09:45:00"
  },
  {
    id: "s3",
    warehouseId: "w2",
    itemId: "item1",
    quantity: 50,
    lastUpdated: "2023-05-12T16:20:00"
  },
  {
    id: "s4",
    warehouseId: "w2",
    itemId: "item3",
    quantity: 120,
    lastUpdated: "2023-05-13T11:10:00"
  },
  {
    id: "s5",
    warehouseId: "w4",
    itemId: "item2",
    quantity: 200,
    lastUpdated: "2023-05-14T10:30:00"
  }
];
