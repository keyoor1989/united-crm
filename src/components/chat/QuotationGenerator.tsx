
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FileDown, Send, Search, User, X } from "lucide-react";
import { ParsedQuotationRequest } from "@/utils/chatCommands/quotationParser";
import { 
  products, 
  generateQuotationNumber, 
  createQuotationItem 
} from "@/data/salesData";
import { Quotation, Product } from "@/types/sales";
import { generateQuotationPdf } from "@/utils/pdfGenerator";
import { toast } from "sonner";
import { useLocation } from "react-router-dom";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CustomerType } from "@/types/customer";
import { supabase } from "@/integrations/supabase/client";

interface QuotationGeneratorProps {
  initialData: ParsedQuotationRequest;
  onComplete: (quotation: Quotation) => void;
  onCancel: () => void;
}

const QuotationGenerator: React.FC<QuotationGeneratorProps> = ({ 
  initialData, 
  onComplete,
  onCancel
}) => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  
  // Extract customer data from URL parameters if available
  const customerIdFromUrl = queryParams.get('customerId') || '';
  const customerNameFromUrl = queryParams.get('customerName') || '';
  const customerEmailFromUrl = queryParams.get('customerEmail') || '';
  const customerPhoneFromUrl = queryParams.get('customerPhone') || '';
  
  // Debug: Log the parameters to see what's being passed
  console.log("URL Parameters in QuotationGenerator:", {
    customerId: customerIdFromUrl,
    customerName: customerNameFromUrl,
    customerEmail: customerEmailFromUrl,
    customerPhone: customerPhoneFromUrl,
    pathname: location.pathname,
    search: location.search,
    fullURL: window.location.href
  });
  
  // State for customer search
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<CustomerType[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);
  
  // Initialize state with URL parameters or initialData as fallback
  const [customerId, setCustomerId] = useState(customerIdFromUrl || '');
  const [customerName, setCustomerName] = useState(customerNameFromUrl || initialData.customerName || '');
  const [customerEmail, setCustomerEmail] = useState(customerEmailFromUrl || '');
  const [customerPhone, setCustomerPhone] = useState(customerPhoneFromUrl || '');
  const [gstPercent, setGstPercent] = useState("18");
  const [items, setItems] = useState(initialData.models.map(model => {
    const product = products.find(p => p.id === model.productId);
    
    return {
      model: model.model,
      productId: model.productId,
      product: product,
      quantity: model.quantity,
      unitPrice: product ? 165000 : 150000, // Default price if not found
    };
  }));

  // Effect to initialize state once component is mounted
  useEffect(() => {
    // Set customer details from URL parameters or initialData
    if (customerNameFromUrl) {
      setCustomerName(customerNameFromUrl);
      console.log("Setting customer name from URL:", customerNameFromUrl);
    } else if (initialData.customerName) {
      setCustomerName(initialData.customerName);
      console.log("Setting customer name from initialData:", initialData.customerName);
    }
    
    if (customerEmailFromUrl) {
      setCustomerEmail(customerEmailFromUrl);
    }
    
    if (customerPhoneFromUrl) {
      setCustomerPhone(customerPhoneFromUrl);
    }
    
    // Auto search for customers if we only have a name but no ID
    if (customerNameFromUrl && !customerIdFromUrl && customerNameFromUrl.length > 2) {
      console.log("Auto-searching for customer:", customerNameFromUrl);
      searchCustomers(customerNameFromUrl);
      setShowCustomerSearch(true);
    }
  }, []);

  // Debug: Log state after it should be set
  useEffect(() => {
    console.log("Current state:", { customerId, customerName, customerEmail, customerPhone });
  }, [customerId, customerName, customerEmail, customerPhone]);

  const handleUnitPriceChange = (index: number, price: string) => {
    const newItems = [...items];
    newItems[index].unitPrice = Number(price);
    setItems(newItems);
  };

  const handleQuantityChange = (index: number, quantity: string) => {
    const newItems = [...items];
    newItems[index].quantity = Number(quantity);
    setItems(newItems);
  };

  const handleProductSelect = (index: number, productId: string) => {
    const newItems = [...items];
    const product = products.find(p => p.id === productId);
    if (product) {
      newItems[index].product = product;
      newItems[index].productId = productId;
    }
    setItems(newItems);
  };

  // Search customers function
  const searchCustomers = async (term: string) => {
    if (term.length < 1) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    try {
      // Search in Supabase database
      const { data, error } = await supabase
        .from('customers')
        .select('id, name, phone, email, area, lead_status, customer_machines(machine_name)')
        .ilike('name', `%${term}%`)
        .order('name')
        .limit(10);
      
      if (error) {
        console.error("Error searching customers:", error);
        toast.error("Failed to search customers");
        return;
      }
      
      // Convert to CustomerType format
      const customers: CustomerType[] = data.map(customer => ({
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email || "",
        location: customer.area,
        lastContact: "N/A",
        machines: customer.customer_machines ? customer.customer_machines.map((m: any) => m.machine_name).filter(Boolean) : [],
        status: "Active"
      }));
      
      console.log("Search results:", customers);
      setSearchResults(customers);
    } catch (error) {
      console.error("Error in search process:", error);
      toast.error("An error occurred while searching");
    } finally {
      setIsSearching(false);
    }
  };

  // Handle customer selection from search results
  const selectCustomer = (customer: CustomerType) => {
    setCustomerId(customer.id);
    setCustomerName(customer.name);
    setCustomerEmail(customer.email || '');
    setCustomerPhone(customer.phone || '');
    setSearchTerm('');
    setSearchResults([]);
    setShowCustomerSearch(false);
    
    toast.success(`Selected customer: ${customer.name}`);
  };

  const saveCustomerIfNeeded = async () => {
    // If we have a name but no ID, we should create a new customer record
    if (customerName && !customerId) {
      try {
        const { data, error } = await supabase
          .from('customers')
          .insert([
            { 
              name: customerName,
              phone: customerPhone || "",
              email: customerEmail || null,
              lead_status: "New",
              area: "",
              customer_type: "Business"
            }
          ])
          .select();
        
        if (error) {
          console.error("Error creating customer:", error);
          toast.error("Failed to save customer information");
        } else if (data && data.length > 0) {
          setCustomerId(data[0].id);
          toast.success("New customer saved to database");
          return data[0].id;
        }
      } catch (error) {
        console.error("Exception saving customer:", error);
      }
    }
    return customerId;
  };

  const generateQuotation = async () => {
    if (!customerName.trim()) {
      toast.error("Please enter a customer name");
      return;
    }
    
    // Save customer to database if needed and get the customer ID
    const finalCustomerId = await saveCustomerIfNeeded();
    
    // Calculate totals
    let subtotal = 0;
    let totalGst = 0;
    
    // Create quotation items
    const quotationItems = items.map(item => {
      if (!item.product && item.productId) {
        item.product = products.find(p => p.id === item.productId) || null;
      }
      
      const quotationItem = createQuotationItem(
        item.product,
        item.quantity,
        item.unitPrice,
        !item.product, // isCustomItem if no product found
        item.product ? undefined : item.model, // use model as name for custom items
        item.product ? undefined : `${item.model} Printer/Copier`, // default description for custom items
        "Copier"
      );
      
      subtotal += item.quantity * item.unitPrice;
      totalGst += quotationItem.gstAmount;
      
      return quotationItem;
    });
    
    // Create quotation object
    const today = new Date();
    const validUntil = new Date();
    validUntil.setDate(today.getDate() + 15);
    
    const quotation: Quotation = {
      id: Math.random().toString(36).substring(2, 9),
      quotationNumber: generateQuotationNumber(),
      customerId: finalCustomerId || Math.random().toString(36).substring(2, 9),
      customerName: customerName,
      items: quotationItems,
      subtotal: subtotal,
      totalGst: totalGst,
      grandTotal: subtotal + totalGst,
      createdAt: today.toISOString().split('T')[0],
      validUntil: validUntil.toISOString().split('T')[0],
      status: "Draft",
      notes: "",
      terms: "Payment terms: 50% advance, 50% on delivery.\nDelivery within 7-10 working days after confirmation."
    };
    
    // Save quotation to Supabase if possible
    try {
      const { error } = await supabase
        .from('quotations')
        .insert([
          {
            quotation_number: quotation.quotationNumber,
            customer_id: finalCustomerId,
            customer_name: customerName,
            items: quotationItems,
            subtotal: subtotal,
            total_gst: totalGst,
            grand_total: subtotal + totalGst,
            status: "Draft",
            notes: "",
            terms: "Payment terms: 50% advance, 50% on delivery.\nDelivery within 7-10 working days after confirmation."
          }
        ]);
      
      if (error) {
        console.log("Error saving quotation to database:", error);
        // We continue even if the database save fails
        // This handles the case where the table might not exist yet
      } else {
        toast.success("Quotation saved to database");
      }
    } catch (error) {
      console.error("Exception saving quotation:", error);
      // Continue even if saving fails
    }
    
    // Generate PDF for the quotation
    try {
      generateQuotationPdf(quotation);
      toast.success("Quotation PDF generated successfully");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF");
    }
    
    // Complete the flow
    onComplete(quotation);
  };

  return (
    <div className="space-y-4 bg-muted p-4 rounded-md">
      <h3 className="font-medium">Generate Quotation {customerNameFromUrl ? `for ${customerNameFromUrl}` : ''}</h3>
      
      <div className="space-y-2">
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <Label htmlFor="customerName">Customer Name</Label>
            <Input
              id="customerName"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Enter customer name"
            />
          </div>
          <Button 
            variant="outline" 
            onClick={() => setShowCustomerSearch(!showCustomerSearch)}
            title="Search customers"
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>
        
        {showCustomerSearch && (
          <div className="p-3 border rounded-md bg-background">
            <div className="flex items-center gap-2 mb-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search customers..." 
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  searchCustomers(e.target.value);
                }}
                className="flex-1"
                autoFocus
              />
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setShowCustomerSearch(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {isSearching ? (
              <div className="py-2 text-center text-sm text-muted-foreground">
                Searching...
              </div>
            ) : searchResults.length > 0 ? (
              <div className="max-h-60 overflow-y-auto">
                {searchResults.map((customer) => (
                  <div 
                    key={customer.id}
                    className="p-2 hover:bg-muted rounded-md cursor-pointer flex items-center gap-2"
                    onClick={() => selectCustomer(customer)}
                  >
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="font-medium">{customer.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {customer.phone}
                        {customer.email && ` • ${customer.email}`}
                      </div>
                    </div>
                    {customer.machines.length > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {customer.machines.length} machines
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            ) : searchTerm.length > 0 ? (
              <div className="py-2 text-center text-sm text-muted-foreground">
                No customers found
              </div>
            ) : (
              <div className="py-2 text-center text-sm text-muted-foreground">
                Type to search customers
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="customerEmail">Customer Email (Optional)</Label>
        <Input
          id="customerEmail"
          value={customerEmail}
          onChange={(e) => setCustomerEmail(e.target.value)}
          placeholder="Enter customer email"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="customerPhone">Customer Phone (Optional)</Label>
        <Input
          id="customerPhone"
          value={customerPhone}
          onChange={(e) => setCustomerPhone(e.target.value)}
          placeholder="Enter customer phone"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="gst">GST Percentage</Label>
        <Select value={gstPercent} onValueChange={setGstPercent}>
          <SelectTrigger>
            <SelectValue placeholder="Select GST %" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">5%</SelectItem>
            <SelectItem value="12">12%</SelectItem>
            <SelectItem value="18">18%</SelectItem>
            <SelectItem value="28">28%</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-3">
        <Label>Products</Label>
        {items.map((item, index) => (
          <div key={index} className="bg-background p-3 rounded-md space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium">Item #{index + 1}</span>
              <Badge variant="outline">{item.model}</Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor={`product-${index}`}>Select Product</Label>
                <Select 
                  value={item.productId || ""} 
                  onValueChange={(value) => handleProductSelect(index, value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor={`quantity-${index}`}>Quantity</Label>
                <Input
                  id={`quantity-${index}`}
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => handleQuantityChange(index, e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor={`price-${index}`}>Unit Price (₹)</Label>
              <Input
                id={`price-${index}`}
                type="number"
                value={item.unitPrice}
                onChange={(e) => handleUnitPriceChange(index, e.target.value)}
              />
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        
        <div className="space-x-2">
          <Button variant="outline" onClick={generateQuotation}>
            <FileDown className="h-4 w-4 mr-2" />
            Generate PDF
          </Button>
          
          <Button onClick={generateQuotation}>
            <Send className="h-4 w-4 mr-2" />
            Create Quotation
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuotationGenerator;
