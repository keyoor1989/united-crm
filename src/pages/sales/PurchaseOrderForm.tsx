import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Form, FormField, FormItem, FormLabel, FormControl, FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { 
  PlusCircle, Trash2, ArrowLeft, Save, SendIcon, 
  CheckSquare, Building, Calendar, TruckIcon, Loader2
} from "lucide-react";
import { useForm } from 'react-hook-form';
import { 
  products, createPurchaseOrderItem
} from '@/data/salesData';
import { useVendors } from '@/contexts/VendorContext';
import {
  fetchPurchaseOrderById,
  createPurchaseOrder,
  updatePurchaseOrder,
  generatePurchaseOrderNumber
} from '@/services/purchaseOrderService';
import { 
  ProductCategory, Product, PurchaseOrder, PurchaseOrderItem, 
  PurchaseOrderStatus
} from '@/types/sales';

interface PurchaseOrderFormValues {
  poNumber: string;
  vendorId: string;
  vendorName: string;
  createdAt: string;
  deliveryDate: string;
  notes: string;
  terms: string;
  status: PurchaseOrderStatus;
}

const defaultProductSpecs = {
  speed: '',
  color: false,
  ram: '',
  paperTray: '',
  duplex: false
};

const PurchaseOrderForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const { toast } = useToast();
  const { vendors } = useVendors();

  // Form state
  const [items, setItems] = useState<PurchaseOrderItem[]>([]);
  const [subtotal, setSubtotal] = useState<number>(0);
  const [totalGst, setTotalGst] = useState<number>(0);
  const [grandTotal, setGrandTotal] = useState<number>(0);
  const [loading, setLoading] = useState(isEditMode);
  
  // New item form state
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | ''>('');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [unitPrice, setUnitPrice] = useState<number>(0);
  const [gstPercent, setGstPercent] = useState<number>(18);
  const [isCustomItem, setIsCustomItem] = useState<boolean>(false);
  const [customName, setCustomName] = useState<string>('');
  const [customDescription, setCustomDescription] = useState<string>('');
  
  // Product specs state (for editable specs)
  const [productSpecs, setProductSpecs] = useState(defaultProductSpecs);
  
  // Filter products by selected category
  const filteredProducts = selectedCategory 
    ? products.filter(p => p.category === selectedCategory) 
    : products;
  
  // Setup form
  const form = useForm<PurchaseOrderFormValues>({
    defaultValues: {
      poNumber: '',
      vendorId: '',
      vendorName: '',
      createdAt: new Date().toISOString().split('T')[0],
      deliveryDate: new Date(
        new Date().setDate(new Date().getDate() + 14)
      ).toISOString().split('T')[0],
      notes: 'Please confirm receipt of this purchase order.',
      terms: 'Payment will be processed upon delivery and inspection.',
      status: 'Draft' as PurchaseOrderStatus,
    }
  });
  
  // Load purchase order data if in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      try {
        setLoading(true);
        const loadPurchaseOrder = async () => {
          const order = await fetchPurchaseOrderById(id);
          
          if (order) {
            // Set form values
            form.reset({
              poNumber: order.poNumber,
              vendorId: order.vendorId,
              vendorName: order.vendorName,
              createdAt: new Date(order.createdAt).toISOString().split('T')[0],
              deliveryDate: new Date(order.deliveryDate).toISOString().split('T')[0],
              notes: order.notes || '',
              terms: order.terms || '',
              status: order.status,
            });
            
            // Set items and totals
            if (typeof order.items === 'string') {
              try {
                // Parse the JSON string into an array of PurchaseOrderItem
                const parsedItems = JSON.parse(order.items) as PurchaseOrderItem[];
                setItems(parsedItems);
              } catch (error) {
                console.error("Error parsing order items:", error);
                setItems([]);
              }
            } else {
              setItems(order.items as PurchaseOrderItem[]);
            }
            
            setSubtotal(order.subtotal);
            setTotalGst(order.totalGst);
            setGrandTotal(order.grandTotal);
          } else {
            toast({
              title: "Error",
              description: "Purchase order not found",
              variant: "destructive",
            });
            navigate('/purchase-orders');
          }
        };
        
        loadPurchaseOrder();
      } catch (error) {
        console.error("Error loading purchase order:", error);
        toast({
          title: "Error",
          description: "Failed to load purchase order data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
  }, [id, isEditMode, navigate, form, toast]);
  
  // Generate PO number for new orders
  useEffect(() => {
    if (!isEditMode) {
      const generatePONumber = async () => {
        try {
          const poNumber = await generatePurchaseOrderNumber();
          form.setValue('poNumber', poNumber);
        } catch (error) {
          console.error("Error generating PO number:", error);
          // Fallback to a simple format if generation fails
          const date = new Date();
          const fallbackNumber = `PO-${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
          form.setValue('poNumber', fallbackNumber);
        }
      };
      
      generatePONumber();
    }
  }, [isEditMode, form]);
  
  // Handle vendor selection
  const handleVendorChange = (vendorId: string) => {
    const vendor = vendors.find(v => v.id === vendorId);
    if (vendor) {
      form.setValue('vendorId', vendor.id);
      form.setValue('vendorName', vendor.name);
    }
  };
  
  // Handle product selection
  useEffect(() => {
    if (selectedProductId) {
      const product = products.find(p => p.id === selectedProductId);
      if (product) {
        setUnitPrice(0); // Reset price for new selection
        setGstPercent(product.defaultGstPercent);
        setProductSpecs({
          speed: product.specs.speed || '',
          color: product.specs.color,
          ram: product.specs.ram || '',
          paperTray: product.specs.paperTray || '',
          duplex: product.specs.duplex
        });
      }
    }
  }, [selectedProductId]);
  
  // Calculate totals
  useEffect(() => {
    let newSubtotal = 0;
    let newTotalGst = 0;
    
    items.forEach(item => {
      newSubtotal += item.quantity * item.unitPrice;
      newTotalGst += item.gstAmount;
    });
    
    setSubtotal(newSubtotal);
    setTotalGst(newTotalGst);
    setGrandTotal(newSubtotal + newTotalGst);
  }, [items]);
  
  // Add item to purchase order
  const handleAddItem = () => {
    if (isCustomItem) {
      // Validate custom item inputs
      if (!customName) {
        toast({
          title: "Error",
          description: "Please enter a name for the custom item",
          variant: "destructive",
        });
        return;
      }
      
      const newItem = createPurchaseOrderItem(
        null, 
        quantity, 
        unitPrice, 
        true, 
        customName, 
        customDescription, 
        selectedCategory as ProductCategory || 'Other'
      );
      
      setItems([...items, newItem]);
      resetItemForm();
    } else {
      // Validate product selection
      if (!selectedProductId) {
        toast({
          title: "Error",
          description: "Please select a product",
          variant: "destructive",
        });
        return;
      }
      
      const product = products.find(p => p.id === selectedProductId);
      
      if (!product) {
        toast({
          title: "Error",
          description: "Selected product not found",
          variant: "destructive",
        });
        return;
      }
      
      // Create a new item with the current specs
      const newItem: PurchaseOrderItem = {
        id: Math.random().toString(36).substring(2, 11),
        productId: product.id,
        name: product.name,
        description: `${product.category} ${product.name}`,
        category: product.category,
        specs: {
          ...productSpecs,
          additionalSpecs: product.specs.additionalSpecs
        },
        quantity,
        unitPrice,
        gstPercent,
        gstAmount: (unitPrice * quantity * gstPercent) / 100,
        total: unitPrice * quantity + (unitPrice * quantity * gstPercent) / 100,
        isCustomItem: false
      };
      
      setItems([...items, newItem]);
      resetItemForm();
    }
  };
  
  // Reset item form
  const resetItemForm = () => {
    setSelectedCategory('');
    setSelectedProductId('');
    setQuantity(1);
    setUnitPrice(0);
    setGstPercent(18);
    setIsCustomItem(false);
    setCustomName('');
    setCustomDescription('');
    setProductSpecs(defaultProductSpecs);
  };
  
  // Remove item from purchase order
  const handleRemoveItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };
  
  // Save purchase order
  const onSubmit = async (data: PurchaseOrderFormValues) => {
    if (!data.vendorId) {
      toast({
        title: "Error",
        description: "Please select a vendor",
        variant: "destructive",
      });
      return;
    }
    
    if (items.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one item to the purchase order",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setLoading(true);
      
      const orderData: Omit<PurchaseOrder, 'id'> = {
        poNumber: data.poNumber,
        vendorId: data.vendorId,
        vendorName: data.vendorName,
        items,
        subtotal,
        totalGst,
        grandTotal,
        createdAt: data.createdAt,
        deliveryDate: data.deliveryDate,
        status: data.status,
        notes: data.notes,
        terms: data.terms
      };
      
      if (isEditMode && id) {
        await updatePurchaseOrder(id, orderData);
        toast({
          title: "Success",
          description: "Purchase order updated successfully!"
        });
      } else {
        await createPurchaseOrder(orderData);
        toast({
          title: "Success",
          description: "Purchase order created successfully!"
        });
      }
      
      navigate('/purchase-orders');
    } catch (error) {
      console.error("Error saving purchase order:", error);
      toast({
        title: "Error",
        description: "Failed to save purchase order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="container mx-auto py-6 flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
        <p>Loading purchase order data...</p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/purchase-orders')} 
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isEditMode ? 'Edit Purchase Order' : 'New Purchase Order'}
          </h1>
          <p className="text-muted-foreground">
            {isEditMode 
              ? `Editing PO ${form.getValues().poNumber}` 
              : 'Create a new purchase order for your vendor'}
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* PO details section */}
            <div className="bg-card rounded-lg border p-6 shadow-sm">
              <h2 className="text-lg font-medium mb-4">Purchase Order Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="poNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PO Number</FormLabel>
                      <FormControl>
                        <Input {...field} readOnly />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="createdAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="deliveryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>Delivery Date</span>
                        </div>
                      </FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="vendorId"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>
                        <div className="flex items-center">
                          <Building className="h-4 w-4 mr-1" />
                          <span>Vendor</span>
                        </div>
                      </FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={handleVendorChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select vendor" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {vendors.map(vendor => (
                            <SelectItem key={vendor.id} value={vendor.id}>
                              {vendor.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Draft">Draft</SelectItem>
                          <SelectItem value="Sent">Sent</SelectItem>
                          <SelectItem value="Confirmed">Confirmed</SelectItem>
                          <SelectItem value="Received">Received</SelectItem>
                          <SelectItem value="Cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            {/* Add items section */}
            <div className="bg-card rounded-lg border p-6 shadow-sm">
              <h2 className="text-lg font-medium mb-4">Add Items</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <div className="mb-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="customItem"
                        checked={isCustomItem}
                        onChange={() => setIsCustomItem(!isCustomItem)}
                        className="rounded border-gray-300 focus:ring-primary"
                      />
                      <label htmlFor="customItem" className="text-sm font-medium">
                        Add custom item
                      </label>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Category</label>
                      <Select
                        value={selectedCategory}
                        onValueChange={(value) => {
                          setSelectedCategory(value as ProductCategory);
                          setSelectedProductId('');
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Copier">Copier</SelectItem>
                          <SelectItem value="Printer">Printer</SelectItem>
                          <SelectItem value="Finishing Machine">Finishing Machine</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {isCustomItem ? (
                      <>
                        <div>
                          <label className="text-sm font-medium">Name</label>
                          <Input
                            value={customName}
                            onChange={(e) => setCustomName(e.target.value)}
                            placeholder="Enter custom item name"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Description</label>
                          <Textarea
                            value={customDescription}
                            onChange={(e) => setCustomDescription(e.target.value)}
                            placeholder="Enter description"
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <label className="text-sm font-medium">Product</label>
                          <Select
                            value={selectedProductId}
                            onValueChange={setSelectedProductId}
                            disabled={!selectedCategory}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={selectedCategory ? "Select product" : "Select category first"} />
                            </SelectTrigger>
                            <SelectContent>
                              {filteredProducts.map((product) => (
                                <SelectItem key={product.id} value={product.id}>
                                  {product.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        {selectedProductId && (
                          <div className="bg-muted p-3 rounded-md space-y-3">
                            <h4 className="text-sm font-semibold">Product Specifications</h4>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="text-xs">Speed</label>
                                <Input
                                  value={productSpecs.speed}
                                  onChange={(e) => setProductSpecs({...productSpecs, speed: e.target.value})}
                                  className="h-8 text-sm"
                                  placeholder="e.g., 25 ppm"
                                />
                              </div>
                              <div>
                                <label className="text-xs">Color</label>
                                <Select
                                  value={productSpecs.color ? "yes" : "no"}
                                  onValueChange={(v) => setProductSpecs({...productSpecs, color: v === "yes"})}
                                >
                                  <SelectTrigger className="h-8 text-sm">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="yes">Yes</SelectItem>
                                    <SelectItem value="no">No</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <label className="text-xs">RAM</label>
                                <Input
                                  value={productSpecs.ram}
                                  onChange={(e) => setProductSpecs({...productSpecs, ram: e.target.value})}
                                  className="h-8 text-sm"
                                  placeholder="e.g., 4 GB"
                                />
                              </div>
                              <div>
                                <label className="text-xs">Paper Tray</label>
                                <Input
                                  value={productSpecs.paperTray}
                                  onChange={(e) => setProductSpecs({...productSpecs, paperTray: e.target.value})}
                                  className="h-8 text-sm"
                                  placeholder="e.g., 2 x 500 Sheets"
                                />
                              </div>
                              <div>
                                <label className="text-xs">Duplex</label>
                                <Select
                                  value={productSpecs.duplex ? "yes" : "no"}
                                  onValueChange={(v) => setProductSpecs({...productSpecs, duplex: v === "yes"})}
                                >
                                  <SelectTrigger className="h-8 text-sm">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="yes">Yes</SelectItem>
                                    <SelectItem value="no">No</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Quantity</label>
                    <Input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Unit Price (₹)</label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={unitPrice}
                      onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">GST %</label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={gstPercent}
                      onChange={(e) => setGstPercent(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Amount</label>
                    <div className="flex items-center space-x-4">
                      <div className="grow">
                        <div className="bg-muted p-2 rounded text-right">
                          ₹{((unitPrice * quantity) + ((unitPrice * quantity * gstPercent) / 100)).toFixed(2)}
                        </div>
                      </div>
                      <Button 
                        type="button" 
                        onClick={handleAddItem}
                        className="flex items-center gap-1"
                      >
                        <PlusCircle className="h-4 w-4" />
                        Add
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Items Table */}
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Specs</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Unit Price</TableHead>
                      <TableHead className="text-right">GST %</TableHead>
                      <TableHead className="text-right">GST Amt</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.length > 0 ? (
                      items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{item.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {item.description}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-xs space-y-1">
                              {item.specs.speed && (
                                <div><span className="font-medium">Speed:</span> {item.specs.speed}</div>
                              )}
                              {item.specs.color !== undefined && (
                                <div><span className="font-medium">Color:</span> {item.specs.color ? 'Yes' : 'No'}</div>
                              )}
                              {item.specs.ram && (
                                <div><span className="font-medium">RAM:</span> {item.specs.ram}</div>
                              )}
                              {item.specs.paperTray && (
                                <div><span className="font-medium">Paper Tray:</span> {item.specs.paperTray}</div>
                              )}
                              {item.specs.duplex !== undefined && (
                                <div><span className="font-medium">Duplex:</span> {item.specs.duplex ? 'Yes' : 'No'}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell className="text-right">₹{item.unitPrice.toLocaleString()}</TableCell>
                          <TableCell className="text-right">{item.gstPercent}%</TableCell>
                          <TableCell className="text-right">₹{item.gstAmount.toLocaleString()}</TableCell>
                          <TableCell className="text-right font-medium">₹{item.total.toLocaleString()}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveItem(item.id)}
                            >
                              <Trash2 className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-4 text-muted-foreground">
                          No items added to purchase order yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              
              {/* Totals */}
              <div className="mt-6 flex justify-end">
                <div className="w-80 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>GST:</span>
                    <span>₹{totalGst.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold pt-2 border-t">
                    <span>Total:</span>
                    <span>₹{grandTotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Terms and notes */}
            <div className="bg-card rounded-lg border p-6 shadow-sm">
              <h2 className="text-lg font-medium mb-4">Terms & Notes</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="terms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Terms & Conditions</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={4} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={4} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="flex justify-between items-center">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/purchase-orders')}
              >
                Cancel
              </Button>
              
              <div className="flex gap-2">
                <Button
                  type="submit"
                  onClick={() => form.setValue('status', 'Draft')}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save as Draft
                    </>
                  )}
                </Button>
                
                <Button
                  type="button"
                  onClick={() => {
                    form.setValue('status', 'Sent');
                    form.handleSubmit(onSubmit)();
                  }}
                  variant="default"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <SendIcon className="mr-2 h-4 w-4" />
                      Save & Send
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default PurchaseOrderForm;
