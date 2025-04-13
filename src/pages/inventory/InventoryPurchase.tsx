import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { PlusCircle, Trash2, Search } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { InventoryItem } from '@/types/inventory';

const InventoryPurchase = () => {
  const [formData, setFormData] = useState({
    itemId: '',
    quantity: 1,
    purchaseRate: 0,
    vendorId: '',
    warehouseId: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    invoiceNo: '',
    barcode: '',
    printBarcode: false,
  });

  const [items, setItems] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Update the mock inventory items to match the InventoryItem type fully
  const mockInventoryItems: InventoryItem[] = [
    {
      id: '1',
      name: 'Toner Cartridge',
      category: 'Toner',
      brand: 'Canon',
      model: 'IR2525',
      currentStock: 15,
      minStockLevel: 5,
      maxStockLevel: 30,
      reorderPoint: 10,
      unitCost: 2500,
      unitPrice: 3000,
      location: 'Warehouse A',
      lastRestocked: '2023-01-15',
      createdAt: '2023-01-01',
      modelId: 'model-1',
      brandId: 'brand-1',
      type: 'Toner',
      minQuantity: 5,
      currentQuantity: 15,
      lastPurchasePrice: 2500,
      lastVendor: 'ABC Supplies',
      barcode: 'TON-12345',
      part_name: 'Toner Cartridge',
      quantity: 15,
      min_stock: 5,
      purchase_price: 2500,
      part_number: 'TON-12345',
      compatible_models: ['IR2525', 'IR2530'],
      brand_id: 'brand-1',
      model_id: 'model-1'
    },
    {
      id: '2',
      name: 'Drum Unit',
      category: 'Drum',
      brand: 'HP',
      model: 'LaserJet Pro',
      currentStock: 8,
      minStockLevel: 3,
      maxStockLevel: 20,
      reorderPoint: 5,
      unitCost: 3500,
      unitPrice: 4200,
      location: 'Warehouse B',
      lastRestocked: '2023-02-10',
      createdAt: '2023-01-15',
      modelId: 'model-2',
      brandId: 'brand-2',
      type: 'Drum',
      minQuantity: 3,
      currentQuantity: 8,
      lastPurchasePrice: 3500,
      lastVendor: 'XYZ Electronics',
      barcode: 'DRM-67890',
      part_name: 'Drum Unit',
      quantity: 8,
      min_stock: 3,
      purchase_price: 3500,
      part_number: 'DRM-67890',
      compatible_models: ['LaserJet Pro', 'LaserJet Elite'],
      brand_id: 'brand-2',
      model_id: 'model-2'
    },
    {
      id: '3',
      name: 'Fuser Assembly',
      category: 'Fuser',
      brand: 'Xerox',
      model: 'WorkCentre',
      currentStock: 5,
      minStockLevel: 2,
      maxStockLevel: 15,
      reorderPoint: 3,
      unitCost: 5000,
      unitPrice: 6000,
      location: 'Warehouse A',
      lastRestocked: '2023-03-05',
      createdAt: '2023-02-01',
      modelId: 'model-3',
      brandId: 'brand-3',
      type: 'Fuser',
      minQuantity: 2,
      currentQuantity: 5,
      lastPurchasePrice: 5000,
      lastVendor: 'Tech Parts Inc',
      barcode: 'FUS-24680',
      part_name: 'Fuser Assembly',
      quantity: 5,
      min_stock: 2,
      purchase_price: 5000,
      part_number: 'FUS-24680',
      compatible_models: ['WorkCentre 3345', 'WorkCentre 3325'],
      brand_id: 'brand-3',
      model_id: 'model-3'
    }
  ];

  const mockVendors = [
    {
      id: '1',
      name: 'ABC Suppliers',
    },
    {
      id: '2',
      name: 'XYZ Electronics',
    },
  ];

  const mockWarehouses = [
    {
      id: '1',
      name: 'Main Warehouse',
    },
    {
      id: '2',
      name: 'Secondary Storage',
    },
  ];

  const handleInputChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddItem = () => {
    const newItem = {
      id: uuidv4(),
      ...formData,
    };
    setItems([...items, newItem]);
    setFormData({
      ...formData,
      itemId: '',
      quantity: 1,
      purchaseRate: 0,
    });
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error('Please add at least one item to the purchase.');
      return;
    }
    toast.success('Purchase recorded successfully!');
    setItems([]);
    setFormData({
      ...formData,
      vendorId: '',
      warehouseId: '',
      purchaseDate: new Date().toISOString().split('T')[0],
      invoiceNo: '',
      barcode: '',
      printBarcode: false,
    });
  };

  const filteredItems = mockInventoryItems.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Update the vendor object to include all required properties
  const vendor = {
    id: '1',
    name: 'ABC Suppliers',
    contactPerson: 'John Doe',
    gstNo: 'GST123456',
    phone: '1234567890',
    email: 'contact@abc.com',
    address: '123 Main St, Anytown',
    createdAt: new Date().toISOString()
  };

  return (
    <div className="container mx-auto py-6">
      <Helmet>
        <title>Inventory Management | Record Purchase</title>
      </Helmet>
      <h1 className="text-2xl font-semibold mb-4">Record Purchase</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="vendorId">Vendor</Label>
            <Select
              value={formData.vendorId}
              onValueChange={(value) =>
                handleInputChange({ target: { name: 'vendorId', value } })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select vendor" />
              </SelectTrigger>
              <SelectContent>
                {mockVendors.map((vendor) => (
                  <SelectItem key={vendor.id} value={vendor.id}>
                    {vendor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="warehouseId">Warehouse</Label>
            <Select
              value={formData.warehouseId}
              onValueChange={(value) =>
                handleInputChange({ target: { name: 'warehouseId', value } })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select warehouse" />
              </SelectTrigger>
              <SelectContent>
                {mockWarehouses.map((warehouse) => (
                  <SelectItem key={warehouse.id} value={warehouse.id}>
                    {warehouse.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="purchaseDate">Purchase Date</Label>
            <Input
              type="date"
              id="purchaseDate"
              name="purchaseDate"
              value={formData.purchaseDate}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label htmlFor="invoiceNo">Invoice Number</Label>
            <Input
              type="text"
              id="invoiceNo"
              name="invoiceNo"
              value={formData.invoiceNo}
              onChange={handleInputChange}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="barcode">Barcode</Label>
          <Input
            type="text"
            id="barcode"
            name="barcode"
            value={formData.barcode}
            onChange={handleInputChange}
          />
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="printBarcode"
            name="printBarcode"
            checked={formData.printBarcode}
            onChange={(e) =>
              setFormData({ ...formData, printBarcode: e.target.checked })
            }
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="printBarcode" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Print Barcode
          </label>
        </div>
        <div className="border rounded-md p-4">
          <h3 className="text-lg font-medium mb-4">Add Items</h3>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
            <Input
              type="search"
              placeholder="Search items..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Table className="mt-4">
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Purchase Rate</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleInputChange}
                      className="w-24"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      name="purchaseRate"
                      value={formData.purchaseRate}
                      onChange={handleInputChange}
                      className="w-32"
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button type="button" variant="ghost" size="sm" onClick={handleAddItem}>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div>
          <h3 className="text-lg font-medium mb-4">Purchase Items</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Purchase Rate</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.itemId}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{item.purchaseRate}</TableCell>
                  <TableCell className="text-right">
                    <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveItem(item.id)}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <Button type="submit" className="w-full">
          Record Purchase
        </Button>
      </form>
    </div>
  );
};

export default InventoryPurchase;
