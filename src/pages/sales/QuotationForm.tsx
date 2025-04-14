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
import { toast } from 'sonner';
import { 
  PlusCircle, Trash2, ArrowLeft, Save, PrinterIcon, 
  CheckCircle, Send, Copy, XCircle, Loader2 
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { 
  products, generateQuotationNumber, createQuotationItem
} from '@/data/salesData';
import { 
  ProductCategory, Product, Quotation, QuotationItem, QuotationStatus 
} from '@/types/sales';
import CustomerSearch from '@/components/chat/quotation/CustomerSearch';
import { CustomerType } from '@/types/customer';
import { 
  createQuotation, 
  updateQuotation, 
  fetchQuotationById 
} from '@/services/quotationService';
import { generateQuotationPdf } from '@/utils/pdfGenerator';

interface QuotationFormValues {
  quotationNumber: string;
  customerName: string;
  customerId: string;
  createdAt: string;
  validUntil: string;
  notes: string;
  terms: string;
  status: QuotationStatus;
}

const defaultProductSpecs = {
  speed: '',
  color: false,
  ram: '',
  paperTray: '',
  duplex: false
};

const QuotationForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFetchingQuotation, setIsFetchingQuotation] = useState<boolean>(isEditMode);

  const [existingQuotation, setExistingQuotation] = useState<Quotation | null>(null);

  const [items, setItems] = useState<QuotationItem[]>([]);
  const [subtotal, setSubtotal] = useState<number>(0);
  const [totalGst, setTotalGst] = useState<number>(0);
  const [grandTotal, setGrandTotal] = useState<number>(0);
  
  const [showCustomerSearch, setShowCustomerSearch] = useState<boolean>(false);
  
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | ''>('');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [unitPrice, setUnitPrice] = useState<number>(0);
  const [gstPercent, setGstPercent] = useState<number>(18);
  const [isCustomItem, setIsCustomItem] = useState<boolean>(false);
  const [customName, setCustomName] = useState<string>('');
  const [customDescription, setCustomDescription] = useState<string>('');
  
  const [productSpecs, setProductSpecs] = useState(defaultProductSpecs);
  
  const filteredProducts = selectedCategory 
    ? products.filter(p => p.category === selectedCategory) 
    : products;
  
  const form = useForm<QuotationFormValues>({
    defaultValues: {
      quotationNumber: generateQuotationNumber(),
      customerName: '',
      customerId: '',
      createdAt: new Date().toISOString().split('T')[0],
      validUntil: new Date(
        new Date().setDate(new Date().getDate() + 30)
      ).toISOString().split('T')[0],
      notes: 'Thank you for your business.',
      terms: 'Payment due within 30 days of acceptance. Delivery within 2 weeks.',
      status: 'Draft',
    }
  });
  
  useEffect(() => {
    if (isEditMode && id) {
      const fetchQuotation = async () => {
        try {
          setIsFetchingQuotation(true);
          const quotation = await fetchQuotationById(id);
          
          if (quotation) {
            setExistingQuotation(quotation);
            setItems(quotation.items);
            setSubtotal(quotation.subtotal);
            setTotalGst(quotation.totalGst);
            setGrandTotal(quotation.grandTotal);
            
            form.reset({
              quotationNumber: quotation.quotationNumber,
              customerName: quotation.customerName,
              customerId: quotation.customerId || '',
              createdAt: quotation.createdAt,
              validUntil: quotation.validUntil,
              notes: quotation.notes,
              terms: quotation.terms,
              status: quotation.status,
            });
          } else {
            toast.error("Quotation not found");
            navigate('/quotations');
          }
        } catch (error) {
          console.error("Error fetching quotation:", error);
          toast.error("Failed to load quotation");
        } finally {
          setIsFetchingQuotation(false);
        }
      };
      
      fetchQuotation();
    }
  }, [id, isEditMode, navigate, form]);
  
  const toggleCustomerSearch = () => {
    setShowCustomerSearch(!showCustomerSearch);
  };
  
  const handleSelectCustomer = (customer: CustomerType) => {
    form.setValue('customerName', customer.name);
    form.setValue('customerId', customer.id);
    setShowCustomerSearch(false);
    toast.success(`Selected customer: ${customer.name}`);
  };
  
  useEffect(() => {
    if (selectedProductId) {
      const product = products.find(p => p.id === selectedProductId);
      if (product) {
        setUnitPrice(0);
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
  
  const handleAddItem = () => {
    if (isCustomItem) {
      if (!customName) {
        toast.error('Please enter a name for the custom item');
        return;
      }
      
      const newItem = createQuotationItem(
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
      if (!selectedProductId) {
        toast.error('Please select a product');
        return;
      }
      
      const product = products.find(p => p.id === selectedProductId);
      
      if (!product) {
        toast.error('Selected product not found');
        return;
      }
      
      const newItem: QuotationItem = {
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
  
  const handleRemoveItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };
  
  const onSubmit = async (data: QuotationFormValues) => {
    if (items.length === 0) {
      toast.error('Please add at least one item to the quotation');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const quotationData: Omit<Quotation, 'id'> = {
        quotationNumber: data.quotationNumber,
        customerId: data.customerId,
        customerName: data.customerName,
        items,
        subtotal,
        totalGst,
        grandTotal,
        createdAt: data.createdAt,
        validUntil: data.validUntil,
        status: data.status,
        notes: data.notes,
        terms: data.terms
      };
      
      if (isEditMode && id) {
        await updateQuotation(id, quotationData);
        toast.success('Quotation updated successfully');
      } else {
        await createQuotation(quotationData);
        toast.success('Quotation created successfully');
      }
      
      setTimeout(() => {
        navigate('/quotations');
      }, 1500);
    } catch (error) {
      console.error('Error saving quotation:', error);
      toast.error(isEditMode ? 'Failed to update quotation' : 'Failed to create quotation');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePrintQuotation = async () => {
    if (items.length === 0) {
      toast.error('Please add at least one item to the quotation');
      return;
    }

    if (!existingQuotation && !form.getValues('customerName')) {
      toast.error('Please select a customer');
      return;
    }

    try {
      const formValues = form.getValues();
      
      const quotationData: Quotation = {
        id: existingQuotation?.id || Math.random().toString(36).substring(2, 9),
        quotationNumber: formValues.quotationNumber,
        customerId: formValues.customerId,
        customerName: formValues.customerName,
        items,
        subtotal,
        totalGst,
        grandTotal,
        createdAt: formValues.createdAt,
        validUntil: formValues.validUntil,
        status: formValues.status as QuotationStatus,
        notes: formValues.notes,
        terms: formValues.terms
      };
      
      generateQuotationPdf(quotationData);
      toast.success('Quotation PDF generated successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    }
  };

  if (isFetchingQuotation) {
    return (
      <div className="container mx-auto py-6 flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-2 text-muted-foreground">Loading quotation...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/quotations')} 
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isEditMode ? 'Edit Quotation' : 'New Quotation'}
          </h1>
          <p className="text-muted-foreground">
            {isEditMode 
              ? `Editing quotation ${existingQuotation?.quotationNumber}` 
              : 'Create a new quotation for your customer'}
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="bg-card rounded-lg border p-6 shadow-sm">
              <h2 className="text-lg font-medium mb-4">Quotation Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="quotationNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quotation Number</FormLabel>
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
                  name="validUntil"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valid Until</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="customerName"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Customer</FormLabel>
                      <FormControl>
                        <CustomerSearch
                          onSelectCustomer={handleSelectCustomer}
                          showSearch={showCustomerSearch}
                          onToggleSearch={toggleCustomerSearch}
                          customerName={field.value}
                        />
                      </FormControl>
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
                          <SelectItem value="Accepted">Accepted</SelectItem>
                          <SelectItem value="Rejected">Rejected</SelectItem>
                          <SelectItem value="Expired">Expired</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
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
                          No items added to quotation yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              
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
            
            <div className="flex justify-between items-center">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/quotations')}
                disabled={isLoading}
              >
                Cancel
              </Button>
              
              <div className="flex gap-2">
                <Button
                  type="submit"
                  onClick={() => form.setValue('status', 'Draft')}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Save as Draft
                </Button>
                
                <Button
                  type="button"
                  onClick={() => {
                    form.setValue('status', 'Sent');
                    form.handleSubmit(onSubmit)();
                  }}
                  variant="default"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  Save & Send
                </Button>
                
                <Button
                  type="button"
                  onClick={handlePrintQuotation}
                  variant="outline"
                  disabled={isLoading || items.length === 0}
                >
                  <PrinterIcon className="mr-2 h-4 w-4" />
                  Print Preview
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default QuotationForm;
